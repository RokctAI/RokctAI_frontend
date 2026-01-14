"use client";

import { useChat } from "@ai-sdk/react";
import { Attachment, Message } from "ai";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { AI_MODELS } from "@/ai/models";
import { ModelId, ModelSelector } from "./model-selector";
import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";
import { RightPlane } from "./right-plane";
import { LeftSidebar } from "./left-sidebar";
import { ProjectOverviewProps } from "../overviews/project-overview";
import { DealTaskProps } from "../tasks/deal-task";
import { ProjectTaskProps } from "../tasks/project-task";
import { TaskStack } from "../tasks/task-stack";
import { createDraftTask } from "@/ai/local/tasks/actions";
import { createDraftProject } from "@/ai/local/projects/actions";
import { createDraftNote } from "@/ai/local/notes/actions";
import { createDraftLead } from "@/ai/local/crm/actions";
import { createDraftProfileUpdate } from "@/ai/local/hr/actions";
import { aiStore } from "@/lib/ai-notification-store";
import { AiStatusPill } from "@/components/custom/ai-status-pill";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function Chat({
  id,
  initialMessages,
  isPaidUser = false,
}: {
  id: string;
  initialMessages: Array<Message>;
  isPaidUser?: boolean;
}) {
  const router = useRouter();
  const [selectedModelId, setSelectedModelId] = useState<ModelId>(AI_MODELS.FREE.id);
  const [activeModule, setActiveModule] = useState<string>("HR");
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  // Reset Session on Model Change
  const handleModelChange = (newModelId: ModelId) => {
    setSelectedModelId(newModelId);
    // setMessages([]); // Removed per user request to preserve context
    aiStore.push(`Model Switched to ${newModelId}`, "info");
  };

  const handleNewSession = () => {
    setMessages([]);
    aiStore.push("New Work Session Started", "success");
  };

  const { messages, handleSubmit, input, setInput, append, isLoading, stop, setMessages } =
    useChat({
      id,
      body: { id, model: selectedModelId },
      initialMessages,
      maxSteps: 10,
      onFinish: () => {
        window.history.replaceState({}, "", `/chat/${id}`);
      },
      onError: (error) => {
        if (error.message.includes("Quota Exceeded")) {
          router.push("/handson");
        } else {
          // System Error -> Keep Toast as it's a crash/network issue
          toast.error("An error occurred: " + error.message);
        }
      }
    });

  // --- EXISTING EFFECTS (Holidays, Reminders) preserved ---
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch('/api/reminders/pending');
        if (response.ok) {
          const data = await response.json();

          // Personal Reminders -> Status Pill
          if (data.reminders && Array.isArray(data.reminders)) {
            data.reminders.forEach((reminder: any) => {
              aiStore.push(`Reminder: ${reminder.title}`, "alert");
            });
          }

          // System Notifications -> Status Pill
          if (data.notifications && Array.isArray(data.notifications)) {
            data.notifications.forEach((note: any) => {
              const type = note.type === "Alert" ? "alert" : "info";
              aiStore.push(note.subject, type);
            });
          }
        }
      } catch (error) { }
    };

    const checkHolidays = async () => {
      try {
        const { checkUpcomingHoliday } = await import("@/app/actions/ai/holiday");
        const result = await checkUpcomingHoliday();

        if (result.found && result.holiday) {
          const lastPrompted = sessionStorage.getItem('last_holiday_prompt');
          if (lastPrompted === result.holiday.holiday_date) return;
          sessionStorage.setItem('last_holiday_prompt', result.holiday.holiday_date);

          setMessages(prev => [
            ...prev,
            {
              id: `holiday-${Date.now()}`,
              role: 'assistant',
              content: '',
              toolInvocations: [{
                toolName: 'manage_holiday_work',
                toolCallId: `auto-holiday-${Date.now()}`,
                state: 'result',
                args: {},
                result: {
                  ui: "holiday_work_form",
                  holidayName: result.holiday.description || "Holiday",
                  holidayDate: result.holiday.holiday_date
                }
              }]
            }
          ]);
        }
      } catch (e) {
        console.error("Holiday check failed", e);
      }
    };

    fetchReminders();
    checkHolidays();
  }, []);

  // Track processed tool invocations to avoid duplicate notifications
  const [seenToolIds, setSeenToolIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant' || !lastMessage.toolInvocations) return;

    lastMessage.toolInvocations.forEach(tool => {
      if (tool.state === 'result' && !seenToolIds.has(tool.toolCallId)) {
        const result = tool.result as any;
        if (result?.success) {
          const msg = result.message || "Action Completed";
          aiStore.push(msg, "success");
          setSeenToolIds(prev => new Set(prev).add(tool.toolCallId));
        } else if (result?.success === false) {
          const msg = result.error || "Action Failed";
          aiStore.push(msg, "alert");
          setSeenToolIds(prev => new Set(prev).add(tool.toolCallId));
        }
      }
    });
  }, [messages]);

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-dvh w-full bg-background overflow-hidden">
        {/* 1. Left Sidebar */}
        <LeftSidebar
          activeModule={activeModule}
          onModuleSelect={setActiveModule}
          // Sidebar handles open state via context, but we keep activeModule prop
          onNewSession={handleNewSession}
        />

        {/* 2. Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">

          {/* Header Area within Chat Pane */}
          <div className="flex items-center justify-between p-4 border-b h-14">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="h-6 w-px bg-border mx-2" />
              <ModelSelector
                selectedModelId={selectedModelId}
                onModelChange={handleModelChange}
                isPaidUser={isPaidUser}
                onUpgradeClick={() => toast.info("Upgrade to Pro", { description: "Upgrade required." })}
              />
              {/* AI Status Pill */}
              <div className="ml-4">
                <AiStatusPill />
              </div>
            </div>
            {/* Toggle Right Pane Button (Mobile/Desktop) */}
            <button onClick={() => setIsRightOpen(!isRightOpen)} className="p-2 hover:bg-muted rounded-md border text-xs font-medium">
              {isRightOpen ? "Hide Tools" : "Show Tools"}
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth"
          >
            {messages.length === 0 && <Overview />}
            <div className="flex flex-col gap-6 max-w-3xl mx-auto">
              {messages.map((message) => (
                <PreviewMessage
                  key={message.id}
                  chatId={id}
                  role={message.role}
                  content={message.content}
                  attachments={message.experimental_attachments ? message.experimental_attachments : message.attachments}
                  toolInvocations={message.toolInvocations}
                  append={append}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto">
              <form className="flex gap-2 relative items-end">
                <MultimodalInput
                  input={input}
                  setInput={setInput}
                  handleSubmit={handleSubmit}
                  isLoading={isLoading}
                  stop={stop}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  messages={messages}
                  append={append}
                  models={Object.values(AI_MODELS)}
                  selectedModelId={selectedModelId}
                  onModelChange={handleModelChange}
                  onLocalSubmit={(intent, details, text) => {
                    if (intent === "Project") {
                      const draftProject = createDraftProject(text);
                      draftProject.data.modelId = selectedModelId;
                      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }, { id: (Date.now() + 1).toString(), role: 'assistant', content: '', toolInvocations: [{ toolName: 'displayProjectCard', toolCallId: `local-${Date.now()}`, state: 'result', args: { project: draftProject.data }, result: draftProject.data }] }]);
                      return true;
                    }
                    if (intent === "Task") {
                      const draftTask = createDraftTask(text, details?.dateText);
                      draftTask.data.modelId = selectedModelId;
                      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }, { id: (Date.now() + 1).toString(), role: 'assistant', content: '', toolInvocations: [{ toolName: 'displayTaskStack', toolCallId: `local-${Date.now()}`, state: 'result', args: { tasks: [draftTask] }, result: { tasks: [draftTask] } }] }]);
                      return true;
                    }
                    if (intent === "Competitor") {
                      let name = text.replace(/^(add|create|draft|new)\s+(competitor|shop|store|brand|business)\s*/i, '').trim() || "New Competitor";
                      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }, { id: (Date.now() + 1).toString(), role: 'assistant', content: '', toolInvocations: [{ toolName: 'draft_competitor', toolCallId: `local-${Date.now()}`, state: 'result', args: { name }, result: { name } }] }]);
                      return true;
                    }
                    if (intent === "Note") {
                      const draftNote = createDraftNote(text);
                      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }, { id: (Date.now() + 1).toString(), role: 'assistant', content: '', toolInvocations: [{ toolName: 'displayNote', toolCallId: `local-${Date.now()}`, state: 'result', args: { note: draftNote }, result: draftNote }] }]);
                      return true;
                    }
                    if (intent === "Lead") {
                      const draftLead = createDraftLead(text);
                      draftLead.data.modelId = selectedModelId;
                      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }, { id: (Date.now() + 1).toString(), role: 'assistant', content: '', toolInvocations: [{ toolName: 'lead_creation', toolCallId: `local-${Date.now()}`, state: 'result', args: {}, result: draftLead.data }] }]);
                      return true;
                    }
                    if (intent === "Employee") {
                      const draftProfile = createDraftProfileUpdate();
                      draftProfile.data.modelId = selectedModelId;
                      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }, { id: (Date.now() + 1).toString(), role: 'assistant', content: '', toolInvocations: [{ toolName: 'profile_update', toolCallId: `local-${Date.now()}`, state: 'result', args: {}, result: draftProfile.data }] }]);
                      return true;
                    }
                    return false;
                  }}
                />
              </form>
            </div>
          </div>
        </div>

        {/* 3. Right Pane */}
        <RightPlane isOpen={isRightOpen} activeModule={activeModule} />
      </div>
    </SidebarProvider>
  );
}
