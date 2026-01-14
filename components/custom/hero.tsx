"use client";

import { AnimatePresence, motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import React, { useEffect, useState, useRef, ReactNode } from "react";
import { ArrowUpIcon, PaperclipIcon } from "@/components/custom/icons";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { conversations, ChatTurn, sampleTasks } from "@/lib/mock-conversations";
import { AI_MODELS } from "@/ai/models";
import { BotIcon, UserIcon } from "@/components/custom/icons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ListTodo, StickyNote } from "lucide-react";
import { AiStatusPill } from "@/components/custom/ai-status-pill";
import { PLATFORM_NAME } from "@/app/config/platform";
import { Branding } from "./branding";
import { BrandLogo } from "./brand-logo";
import { MultimodalInput } from "./multimodal-input";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LeftSidebar } from "./left-sidebar";
import { RightPlane } from "./right-plane";

type MessageNode = {
  id: string;
  node: ReactNode;
};

import Link from "next/link";
// ...

export function Hero({
  openSignupPopup,
  signupUrl,
  selectedCategory = "rokct",
  onSelectCategory
}: {
  openSignupPopup?: () => void;
  signupUrl?: string;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const [branding, setBranding] = useState<any>(null);
  // State
  const [conversationIndex, setConversationIndex] = useState(0);
  const [mode, setMode] = useState<"placeholder" | "chat">("placeholder");
  const [placeholder, setPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [messages, setMessages] = useState<MessageNode[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { current: timeouts } = useRef<NodeJS.Timeout[]>([]);
  // Interaction State
  const [hasStarted, setHasStarted] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [activeModule, setActiveModule] = useState("HR");
  const [demoTasks, setDemoTasks] = useState<any[]>([]);

  useEffect(() => {
    if (messages.some(m => m.id === 'task-4-user')) {
      setDemoTasks(sampleTasks);
    } else if (messages.length === 0) {
      setDemoTasks([]);
    }
  }, [messages]);

  // ... (existing effects)

  // Handle User Input
  const handleInputChange = (text: string) => {
    setIsUserTyping(true);
    setPlaceholder(text);
    // Stop animations
    if (!isUserTyping) {
      // Clear timeouts if any new ones were to be set, though effect deps might handle it
      // We can simply rely on isUserTyping flagged true to bypass effect logic
    }
  };

  useEffect(() => {
    // If user is typing, do NOT run the demo animation loop
    if (isUserTyping) return;

    if (!hasStarted) {
      setHasStarted(true);
      return;
    }

    // ... (rest of the effect logic needs to be mindful of isUserTyping)
    // Actually, simpler: Wrap the ENTIRE existing animation effect in `if (isUserTyping) return;` 
    // But I need to modify the EXISTING effect.
    // I will use replace_file_content to wrap the start of the primary effect.
  }, [hasStarted, isUserTyping]); // Add isUserTyping dependency

  // ...

  // Inside Render Logic for MultimodalInput:
  // setInput={handleInputChange} 

  // Wait, I need to know where the Effect starts.
  // I will read Hero.tsx again to be precise with the Effect modification.


  const currentConversation = conversations[conversationIndex];

  // Main state machine driver
  useEffect(() => {
    // Branding is handled by the Branding component
  }, []);

  useEffect(() => {
    // Clear all pending timeouts from the previous conversation
    timeouts.forEach(clearTimeout);
    timeouts.length = 0; // Clear the array

    const nextConversation = conversations[conversationIndex];
    setMode(nextConversation.type);

    if (nextConversation.type === "chat") {
      setMessages([]);
      setTurnIndex(0);
    }
  }, [conversationIndex, timeouts]);


  // Placeholder animation logic
  useEffect(() => {
    if (isUserTyping) return;
    if (mode !== "placeholder" || currentConversation.type !== "placeholder") return;

    const handleTyping = () => {
      if (!hasStarted) setHasStarted(true);
      const fullText = currentConversation.text;
      if (isDeleting) {
        if (placeholder.length > 0) {
          setPlaceholder((prev) => prev.slice(0, -1));
        } else {
          setIsDeleting(false);
          setConversationIndex((prev) => (prev + 1) % conversations.length);
        }
      } else {
        if (placeholder.length < fullText.length) {
          setPlaceholder(fullText.slice(0, placeholder.length + 1));
        } else {
          timeouts.push(setTimeout(() => setIsDeleting(true), 3000));
        }
      }
    };

    timeouts.push(setTimeout(handleTyping, isDeleting ? 80 : 120));
  }, [placeholder, isDeleting, mode, currentConversation, timeouts, hasStarted, isUserTyping]);

  // Chat animation logic
  useEffect(() => {
    if (isUserTyping) return;
    if (mode !== "chat" || currentConversation.type !== "chat") return;
    if (!hasStarted) setHasStarted(true);

    const turns = currentConversation.turns;
    if (turnIndex >= turns.length) {
      timeouts.push(
        setTimeout(() => {
          setConversationIndex((prev) => (prev + 1) % conversations.length);
        }, 3000)
      );
      return;
    }

    const currentTurn = turns[turnIndex];
    let typeInterval: any;

    // If the user message for this turn is already displayed, do nothing.
    if (messages.some((m) => m.id === `${currentTurn.id}-user`)) {
      return;
    }

    // 1. Type user message in placeholder
    setPlaceholder("");
    let currentText = "";
    typeInterval = setInterval(() => {
      currentText = currentTurn.userMessage.slice(0, currentText.length + 1);
      setPlaceholder(currentText);
      if (currentText.length === currentTurn.userMessage.length) {
        clearInterval(typeInterval);

        const userMessageNode = (
          <div className="flex flex-row gap-4 px-4 w-full md:px-0 justify-end">
            <div className="flex flex-col gap-2 max-w-[80%] items-end">
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-2xl rounded-tr-sm">
                {currentTurn.userMessage}
              </div>
            </div>
            <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500 bg-white dark:bg-black">
              <UserIcon />
            </div>
          </div>
        );
        setMessages((prev) => [...prev, { id: `${currentTurn.id}-user`, node: userMessageNode }]);

        if (currentTurn.botResponse) {
          setPlaceholder(`${PLATFORM_NAME} is thinking...`);
          timeouts.push(setTimeout(() => {
            const botResponseNode = (
              <div className="flex flex-row gap-4 px-4 w-full md:px-0">
                <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500 bg-white dark:bg-black">
                  <BrandLogo width={16} height={16} />
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[90%]">
                  {/* Badge Row */}

                  <div className="text-zinc-800 dark:text-zinc-300">
                    {currentTurn.botResponse?.text}
                  </div>

                  {currentTurn.botResponse?.Component && (
                    <div className="w-full mt-2 border rounded-md overflow-hidden bg-background">
                      <currentTurn.botResponse.Component {...currentTurn.botResponse.props} />
                    </div>
                  )}
                </div>
              </div>
            );
            setMessages((prev) => [...prev, { id: `${currentTurn.id}-bot`, node: botResponseNode }]);
            setPlaceholder("");
            timeouts.push(setTimeout(() => setTurnIndex((t) => t + 1), 1500));
          }, 1500));
        } else {
          timeouts.push(setTimeout(() => setTurnIndex((t) => t + 1), 1500));
        }
      }
    }, 50);

    return () => {
      clearInterval(typeInterval);
    };
  }, [mode, currentConversation, turnIndex, resolvedTheme, timeouts, hasStarted, messages, isUserTyping]);

  // Auto-scroll for chat
  useEffect(() => {
    if (mode === "chat" && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, mode]);

  useEffect(() => {
    // Cleanup all timeouts on unmount
    return () => timeouts.forEach(clearTimeout);
  }, [timeouts]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <SidebarProvider defaultOpen={false} storageKey="sidebar:hero-left">
      <div className="flex w-full bg-background h-[calc(100vh-5rem)]">
        <div className="hidden md:block h-full relative z-20">
          <LeftSidebar style={{ position: 'absolute', height: '100%' }} className="!absolute left-0 top-0 !h-full border-r border-border/30" activeModule={activeModule} onModuleSelect={setActiveModule} onNewSession={() => { }} />
        </div>

        <SidebarProvider defaultOpen={true} storageKey="sidebar:hero-right">
          <div className="flex-1 flex h-full min-w-0">
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
              <section className="relative w-full h-full flex flex-col items-center justify-between text-center bg-white text-black dark:bg-black dark:text-white">
                <div className="absolute inset-0 bg-grid-black/[0.01] dark:bg-grid-white/[0.01] bg-white dark:bg-black pointer-events-none [mask-image:linear-gradient(to_bottom,black_10%,transparent_70%)]"></div>
                <div className="absolute top-4 z-50 max-w-md mx-auto">
                  <AiStatusPill />
                </div>

                <div className="relative z-10 flex flex-col items-center w-full max-w-xl px-4 pt-8 grow justify-center min-h-0 mb-8">
                  <AnimatePresence mode="wait">
                    {!hasStarted ? (
                      <motion.div
                        key="initial-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full flex flex-col items-center justify-center min-h-[30vh]"
                      >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            What&apos;s your main goal?
                          </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400">
                          {PLATFORM_NAME} is an AI Agent that does your tasks for you.
                        </p>
                      </motion.div>
                    ) : mode === "chat" ? (
                      <motion.div
                        key="chat-view"
                        ref={scrollContainerRef}
                        className="size-full max-w-lg mx-auto flex flex-col items-start space-y-4 overflow-y-auto justify-end pb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <AnimatePresence>
                          {messages.map((message) => (
                            <motion.div
                              key={message.id}
                              layout
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                              className="w-full"
                            >
                              {message.node}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="placeholder-spacer"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 1 }}
                        className="size-full max-w-lg mx-auto"
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative z-10 w-full max-w-xl px-4 pb-6">
                  {(() => {
                    const activeTurn = mode === 'chat' && conversations[conversationIndex].type === 'chat'
                      ? conversations[conversationIndex].turns[turnIndex]
                      : null;

                    const shouldShow = activeTurn && placeholder.length > 3;
                    const forcedIntent = shouldShow ? activeTurn.botResponse?.intent : undefined;
                    const forcedAction = shouldShow ? activeTurn.botResponse?.action : undefined;

                    // Mock Models with Name Property
                    const mockModels = Object.values(AI_MODELS).map(m => ({ id: m.id, name: m.label }));

                    return (
                      <MultimodalInput
                        input={placeholder}
                        setInput={handleInputChange}
                        isLoading={false}
                        stop={() => { }}
                        attachments={[]}
                        setAttachments={() => { }}
                        messages={[]}
                        allowSuggestions={false}
                        useWorker={false}
                        forcedIntent={forcedIntent}
                        forcedAction={forcedAction}
                        models={mockModels}
                        selectedModelId={AI_MODELS.PAID.id} // Default to Pro/Paid model for Hero demo
                        onModelChange={() => { }}
                        append={async () => null}
                        handleSubmit={(e) => {
                          e?.preventDefault?.();
                          const pricingSection = document.getElementById("pricing");
                          if (pricingSection) {
                            pricingSection.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                      />
                    );
                  })()}

                </div>
              </section>
            </div>
            <div className="hidden md:block h-full relative z-20">
              <RightPlane
                activeModule={activeModule}
                isDemo={true}
                demoTasks={demoTasks}
                style={{ position: 'absolute', height: '100%' }}
                className="!absolute right-0 top-0 !h-full border-l border-border/30"
              />
            </div>
          </div>
        </SidebarProvider>
      </div>
    </SidebarProvider>
  );
}
