/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { AI_MODELS } from "@/ai/models";
import { ModelSelector } from "./model-selector";
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
import {
  type AppendMessage,
  type ChatAttachment,
  localExchange,
  messageFiles,
  messageText,
  messageToolInvocations,
} from "@/lib/agent-chat-messages";

/** A non-2xx answer from /api/chat, with its status (403: a quota, seat or
 * plan refusal; anything else: ROK could not answer). */
class ChatHttpError extends Error {
  status: number;
  /** The route's `X-Rok-Refusal: quota`: the daily free quota is spent. */
  quota: boolean;
  constructor(message: string, status: number, quota = false) {
    super(message);
    this.name = "ChatHttpError";
    this.status = status;
    this.quota = quota;
  }
}

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function Chat({
  id,
  initialMessages,
  isPaidUser = false,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  isPaidUser?: boolean;
}) {
  const router = useRouter();
  const [selectedModelId, setSelectedModelId] = useState<string>(
    AI_MODELS.FREE.id,
  );
  const [availableModels, setAvailableModels] = useState<any>(AI_MODELS);

  useEffect(() => {
    async function loadModels() {
      try {
        const { getAvailableModels } = await import("@/app/actions/ai/tenant");
        const res = await getAvailableModels();
        if (res.success && res.models) {
          setAvailableModels(res.models);
        }
      } catch (err) {
        console.warn("Failed to load models dynamically from backend:", err);
      }
    }
    loadModels();
  }, []);

  const [activeModule, setActiveModule] = useState<string>("HR");
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  // Reset Session on Model Change
  const handleModelChange = (newModelId: string) => {
    setSelectedModelId(newModelId);
    // setMessages([]); // Removed per user request to preserve context
    aiStore.push(`Model Switched to ${newModelId}`, "info");
  };

  const handleNewSession = () => {
    // A new session is a new chat id: sending under the old id would
    // overwrite the stored chat. The old chat stays stored; the root page's
    // archive summarizes it on the next visit to /.
    const fresh = crypto.randomUUID();
    sessionIdRef.current = fresh;
    rolledToRef.current = null;
    window.history.replaceState({}, "", `/chat/${fresh}`);
    setMessages([]);
    aiStore.push("New Work Session Started", "success");
  };

  // AI SDK 6 (ai 6, @ai-sdk/react 3): useChat keeps no input and posts
  // through a transport. The session id and model are read at send time,
  // because a roll-over moves this chat to a new session id without
  // remounting it.
  const sessionIdRef = useRef(id);
  const modelRef = useRef(selectedModelId);
  useEffect(() => {
    modelRef.current = selectedModelId;
  }, [selectedModelId]);
  const rolledToRef = useRef<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            id: sessionIdRef.current,
            messages,
            model: modelRef.current,
          },
        }),
        fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
          const res = await fetch(input, init);
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new ChatHttpError(
              text || res.statusText,
              res.status,
              res.headers.get("x-rok-refusal") === "quota",
            );
          }
          return res;
        }) as typeof fetch,
      }),
    [],
  );

  const { messages, sendMessage, status, stop, setMessages } = useChat<UIMessage>({
    id,
    messages: initialMessages,
    transport,
    onData: (part) => {
      // The route names the new session when this turn rolled the old one.
      if (part.type === "data-session") {
        const next = (part.data as { id?: string } | undefined)?.id;
        if (next) {
          // The server has already moved the session; follow it now, so a
          // stop before the answer finishes cannot leave the old id behind.
          rolledToRef.current = next;
          sessionIdRef.current = next;
          window.history.replaceState({}, "", `/chat/${next}`);
        }
      }
    },
    onFinish: ({ messages: finished }) => {
      const next = rolledToRef.current;
      rolledToRef.current = null;
      if (!next) return;
      // The new session starts from the summary plus this turn (the id and
      // URL moved when the data part arrived): keep only this turn here too,
      // finished or stopped, so the next send does not roll again.
      setMessages(finished.slice(-2));
      aiStore.push("Session optimized & context compressed", "info");
    },
    onError: (error) => {
      if (error instanceof ChatHttpError && error.status === 403 && !error.quota) {
        // Seat or plan refusal: show its line, stay in the chat.
        toast.warning(error.message || "ROK is not available on your plan.");
      } else if (error instanceof ChatHttpError && error.quota) {
        const cleanMsg = error.message.replace(/^Quota Exceeded:\s*/i, "");
        toast.warning("Conversational ROK Limit Complete", {
          description: cleanMsg,
          duration: 15000,
        });
        router.push("/handson");
      } else {
        // System Error -> Keep Toast as it's a crash/network issue
        toast.error("An error occurred: " + error.message);
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";
  const [input, setInput] = useState("");

  const handleSubmit = useCallback(
    (
      event?: { preventDefault?: () => void },
      options?: { body?: { attachments?: Array<ChatAttachment> } },
    ) => {
      event?.preventDefault?.();
      const files = options?.body?.attachments ?? [];
      if (!input.trim() && files.length === 0) return;
      void sendMessage({
        text: input,
        files: files.map((f) => ({
          type: "file" as const,
          url: f.url,
          mediaType: f.contentType || "application/octet-stream",
          filename: f.name,
        })),
      });
      setInput("");
    },
    [input, sendMessage],
  );

  const append: AppendMessage = useCallback(
    async (message) => {
      await sendMessage({ text: message.content });
      return null;
    },
    [sendMessage],
  );

  // --- EXISTING EFFECTS (Holidays, Reminders) preserved ---
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch("/api/reminders/pending");
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
      } catch (error) {}
    };

    const checkHolidays = async () => {
      try {
        const { checkUpcomingHoliday } =
          await import("@/app/actions/ai/holiday");
        const result = await checkUpcomingHoliday();

        if (result.found && result.holiday) {
          const lastPrompted = sessionStorage.getItem("last_holiday_prompt");
          if (lastPrompted === result.holiday.holiday_date) return;
          sessionStorage.setItem(
            "last_holiday_prompt",
            result.holiday.holiday_date,
          );

          setMessages((prev) => [
            ...prev,
            {
              id: `holiday-${Date.now()}`,
              role: "assistant",
              parts: [
                {
                  type: "dynamic-tool",
                  toolName: "manage_holiday_work",
                  toolCallId: `auto-holiday-${Date.now()}`,
                  state: "output-available",
                  input: {},
                  output: {
                    ui: "holiday_work_form",
                    holidayName: result.holiday.description || "Holiday",
                    holidayDate: result.holiday.holiday_date,
                  },
                },
              ],
            },
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
    if (lastMessage.role !== "assistant") return;

    messageToolInvocations(lastMessage).forEach((tool) => {
      if (tool.state === "result" && !seenToolIds.has(tool.toolCallId)) {
        const result = tool.result as any;
        if (result?.success) {
          const msg = result.message || "Action Completed";
          aiStore.push(msg, "success");
          setSeenToolIds((prev) => new Set(prev).add(tool.toolCallId));
        } else if (result?.success === false) {
          const msg = result.error || "Action Failed";
          aiStore.push(msg, "alert");
          setSeenToolIds((prev) => new Set(prev).add(tool.toolCallId));
        }
      }
    });
  }, [messages]);

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const [attachments, setAttachments] = useState<Array<ChatAttachment>>([]);

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
                models={availableModels}
                onUpgradeClick={() =>
                  toast.info("Upgrade to Pro", {
                    description: "Upgrade required.",
                  })
                }
              />
              {/* AI Status Pill */}
              <div className="ml-4">
                <AiStatusPill />
              </div>
            </div>
            {/* Toggle Right Pane Button (Mobile/Desktop) */}
            <button
              onClick={() => setIsRightOpen(!isRightOpen)}
              className="p-2 hover:bg-muted rounded-md border text-xs font-medium"
            >
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
                  content={messageText(message)}
                  attachments={messageFiles(message)}
                  toolInvocations={messageToolInvocations(message)}
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
                  models={Object.values(availableModels).map((m: any) => ({ id: m.id, name: m.label || m.name }))}
                  selectedModelId={selectedModelId}
                  onModelChange={handleModelChange}
                  onLocalSubmit={(intent, details, text) => {
                    if (intent === "Project") {
                      const draftProject = createDraftProject(text);
                      draftProject.data.modelId = selectedModelId;
                      setMessages((prev) => [
                        ...prev,
                        ...localExchange(text, "displayProjectCard", { project: draftProject.data }, draftProject.data),
                      ]);
                      return true;
                    }
                    if (intent === "Task") {
                      const draftTask = createDraftTask(
                        text,
                        details?.dateText,
                      );
                      draftTask.data.modelId = selectedModelId;
                      setMessages((prev) => [
                        ...prev,
                        ...localExchange(text, "displayTaskStack", { tasks: [draftTask] }, { tasks: [draftTask] }),
                      ]);
                      return true;
                    }
                    if (intent === "Competitor") {
                      let name =
                        text
                          .replace(
                            /^(add|create|draft|new)\s+(competitor|shop|store|brand|business)\s*/i,
                            "",
                          )
                          .trim() || "New Competitor";
                      setMessages((prev) => [
                        ...prev,
                        ...localExchange(text, "draft_competitor", { name }, { name }),
                      ]);
                      return true;
                    }
                    if (intent === "Note") {
                      const draftNote = createDraftNote(text);
                      setMessages((prev) => [
                        ...prev,
                        ...localExchange(text, "displayNote", { note: draftNote }, draftNote),
                      ]);
                      return true;
                    }
                    if (intent === "Lead") {
                      const draftLead = createDraftLead(text);
                      draftLead.data.modelId = selectedModelId;
                      setMessages((prev) => [
                        ...prev,
                        ...localExchange(text, "lead_creation", {}, draftLead.data),
                      ]);
                      return true;
                    }
                    if (intent === "Employee") {
                      const draftProfile = createDraftProfileUpdate();
                      draftProfile.data.modelId = selectedModelId;
                      setMessages((prev) => [
                        ...prev,
                        ...localExchange(text, "profile_update", {}, draftProfile.data),
                      ]);
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
