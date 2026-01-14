"use client";

import { Attachment, ChatRequestOptions, Message } from "ai";
import { motion } from "framer-motion";
import * as chrono from "chrono-node";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";
import { toast } from "sonner";

import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { BrandLogo } from "./brand-logo";
import useWindowSize from "./use-window-size";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, ListTodo, StickyNote, MapPin, Loader2, Sparkles, ChevronDown, Mic, FileText, Receipt, File } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getAttendanceStatus } from "@/app/actions/ai/hr";
import { verifyCrmRole } from "@/app/lib/roles";

const suggestedActions = [
  {
    title: "Help me book a flight",
    label: "from San Francisco to London",
    action: "Help me book a flight from San Francisco to London",
  },
  {
    title: "What is the status",
    label: "of flight BA142 flying tmrw?",
    action: "What is the status of flight BA142 flying tmrw?",
  },
];

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  append,
  handleSubmit,
  className,
  allowSuggestions,
  useWorker,
  forcedIntent,
  forcedAction,
  forcedEntity,
  models,
  selectedModelId,
  onModelChange,
  onLocalSubmit,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  append: (
    message: Message | any,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  onLocalSubmit?: (intent: string, details: any, text: string) => boolean;
  className?: string;
  allowSuggestions?: boolean;
  useWorker?: boolean;            // Control AI worker
  forcedIntent?: any;             // Override state
  forcedAction?: string;          // Override details.action
  forcedEntity?: string;          // Override details.entity
  models?: Array<{ id: string; name: string }>; // Optional models list
  selectedModelId?: string;       // Optional selected model
  onModelChange?: (id: string) => void; // Optional handler
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  // Intent Classification State
  const [intent, setIntent] = useState<"Task" | "Note" | "Competitor" | "Lead" | "Employee" | "Project" | "Unknown">("Unknown");
  const [details, setDetails] = useState<{ action: string; entity: string; misc: string; actionScore: number; entityScore: number; miscScore: number; date?: Date; dateText?: string } | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Skip if worker is disabled (e.g. Landing Page)
    if (useWorker === false) return;

    // Initialize Worker
    if (!workerRef.current) {
      workerRef.current = new Worker("/workers/ai-worker.js", { type: "module" });

      workerRef.current.onmessage = (e) => {
        const { status, intent: newIntent, details: newDetails } = e.data;
        if (status === "success") {
          setIntent(newIntent);
          if (newDetails) {
            setDetails(newDetails);
          }
        }
      };

      // Trigger Eager Loading (Download model immediately)
      workerRef.current.postMessage({ task: 'init' });
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, [useWorker]);

  // --- SMART PIN CONTEXT ---
  // --- SMART PIN CONTEXT ---
  const [pinOptions, setPinOptions] = useState<string[]>([]);
  const [pinIndex, setPinIndex] = useState(0);
  const [pinStatus, setPinStatus] = useState<"Loading" | "Ready">("Loading");
  const [activePinContext, setActivePinContext] = useState<string | null>(null);
  const [hasCrmAccess, setHasCrmAccess] = useState(false);
  const [hasHrAccess, setHasHrAccess] = useState(false);
  const [pendingAttachmentContext, setPendingAttachmentContext] = useState<string | null>(null);

  const { data: session } = useSession();

  useEffect(() => {
    const determineContext = async () => {
      // Guard: Only fetch status/roles if we have a session. 
      // This prevents 500 errors on the Landing Page/Guest Mode.
      if (!session) {
        setPinStatus("Ready");
        return;
      }

      try {
        const attStatus = await getAttendanceStatus();
        const isCrm = await verifyCrmRole();

        const options: string[] = [];

        if (attStatus.success) {
          if (attStatus.status === "Checked In") {
            // Context: Checked In.
            // Priority 1: Competitor (If CRM) -> As requested "show competitor"
            if (isCrm) options.push("Add a competitor here");
            // Priority 2: Check Out
            options.push("Check Out");
          } else {
            // Context: Checked Out.
            // Priority 1: Check In -> As requested "says checkin"
            options.push("Check In");
            // Priority 2: Competitor (If CRM) -> As requested "tap again add competitor"
            if (isCrm) options.push("Add a competitor here");
          }
        }
        // Fallback
        if (options.length === 0) options.push("Check In");

        if (options.length === 0) options.push("Check In");

        setPinOptions(options);
        setHasCrmAccess(isCrm);
        const { verifyHrRole } = await import("@/app/lib/roles");
        const isHr = await verifyHrRole();
        setHasHrAccess(isHr);
        setPinStatus("Ready");
      } catch (e) {
        setPinOptions(["Add a competitor here"]);
        setPinStatus("Ready");
      }
    };
    determineContext();
  }, []);

  const handlePinClick = () => {
    if (pinOptions.length === 0) return;

    // Cycle index
    const nextIndex = (pinIndex + 1) % pinOptions.length;
    setPinIndex(nextIndex);

    const selectedOption = pinOptions[nextIndex];

    // Logic: Competitor = Context Mode, Others = Text Pre-fill
    if (selectedOption === "Add a competitor here") {
      setActivePinContext("competitor");
      // Don't auto-fill text for context mode, let user type action
      // But maybe clear input if it was a pre-fill command?
      if (input === "Check In" || input === "Check Out") setInput("");

      // Trigger generic classification with new context
      setTimeout(() => {
        workerRef.current?.postMessage({
          task: "classify_intent",
          text: input || " ", // Trigger with current input (or space to wake up worker)
          context: { entity: "competitor" }
        });
      }, 0);
    } else {
      // Standard Command (Check In / Out)
      setActivePinContext(null); // Clear context
      setInput(selectedOption);
      setTimeout(() => {
        adjustHeight();
        workerRef.current?.postMessage({
          task: "classify_intent",
          text: selectedOption,
          context: null
        });
      }, 0);
    }
  };



  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 0}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setInput(newValue);
    adjustHeight();

    if (!newValue.trim()) {
      setIntent("Unknown");
      return;
    }

    // Extract Date locally
    const dateResult = chrono.parseDate(newValue);

    workerRef.current?.postMessage({
      task: "classify_intent",
      text: newValue,
      context: { entity: activePinContext }
    });

    // Optimistic Update for Date
    if (dateResult) {
      setDetails((prev) => ({
        ...prev!,
        action: prev?.action || "",
        entity: prev?.entity || "",
        misc: prev?.misc || "",
        actionScore: prev?.actionScore || 0,
        entityScore: prev?.entityScore || 0,
        miscScore: prev?.miscScore || 0,
        date: dateResult,
        dateText: format(dateResult, "MMM d, h:mm a") // e.g. "Dec 25, 10:00 AM"
      }));
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    // Client-Side Interception for Tasks and Competitors

    // 1. Task Creation (Local Interception - Date is optional)
    if (intent === "Task" && onLocalSubmit) {
      const handled = onLocalSubmit(intent, details, input);
      if (handled) {
        setInput("");
        setAttachments([]);
        setIntent("Unknown");
        setDetails(null);
        return;
      }
    }

    // 1b. Note Creation
    if (intent === "Note" && onLocalSubmit) {
      const handled = onLocalSubmit(intent, details, input);
      if (handled) {
        setInput("");
        setAttachments([]);
        setIntent("Unknown");
        setDetails(null);
        return;
      }
    }

    // 2. Competitor Draft (Ghost Mode)
    if (intent === "Competitor" && onLocalSubmit) {
      if (!hasCrmAccess) {
        // Fallback to server to handle rejection / explaining
      } else {
        const handled = onLocalSubmit(intent, details, input);
        if (handled) {
          setInput("");
          setAttachments([]);
          setIntent("Unknown");
          setDetails(null);
          return;
        }
      }
    }

    // 3. Lead Creation (CRM Role)
    if (intent === "Lead" && onLocalSubmit) {
      if (hasCrmAccess) {
        const handled = onLocalSubmit(intent, details, input);
        if (handled) {
          setInput("");
          setAttachments([]);
          setIntent("Unknown");
          setDetails(null);
          return;
        }
      }
    }

    // 4. Employee/Profile Update (HR Role)
    if (intent === "Employee" && onLocalSubmit) {
      if (hasHrAccess) {
        const handled = onLocalSubmit(intent, details, input);
        if (handled) {
          setInput("");
          setAttachments([]);
          setIntent("Unknown");
          setDetails(null);
          return;
        }
      }
    }

    // 5. Project Creation
    if (intent === "Project" && onLocalSubmit) {
      const handled = onLocalSubmit(intent, details, input);
      if (handled) {
        setInput("");
        setAttachments([]);
        setIntent("Unknown");
        setDetails(null);
        return;
      }
    }

    handleSubmit(undefined, {
      body: { attachments: attachments },
    });

    setAttachments([]);

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [attachments, handleSubmit, setAttachments, width]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/files/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      } else {
        const { error } = await response.json();
        toast.error(error);
      }
    } catch (error) {
      toast.error("Failed to upload file, please try again!");
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      // Apply Context if Pending
      if (pendingAttachmentContext) {
        setDetails((prev) => ({
          action: prev?.action || "",
          entity: pendingAttachmentContext,
          misc: prev?.misc || "",
          actionScore: prev?.actionScore || 0,
          entityScore: 1.0,
          miscScore: prev?.miscScore || 0,
          date: prev?.date,
          dateText: prev?.dateText
        }));
        setPendingAttachmentContext(null);
      }

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        // Error uploading files
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  return (
    <div className={cn("relative flex flex-col w-full p-4 bg-muted/40 border border-zinc-200 dark:border-zinc-800 rounded-[26px] gap-2 transition-colors focus-within:bg-muted/60 shadow-sm", className)}>

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {/* Suggestion Chips */}
      {allowSuggestions !== false && messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <div className="grid sm:grid-cols-2 gap-4 w-full md:px-0 mx-auto md:max-w-[500px] mb-2">
            {suggestedActions.map((suggestedAction, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.05 * index }}
                key={index}
                className={index > 1 ? "hidden sm:block" : "block"}
              >
                <button
                  onClick={async () => {
                    append({
                      role: "user",
                      content: suggestedAction.action,
                    });
                  }}
                  className="border-none bg-muted/50 w-full text-left border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-lg p-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col"
                >
                  <span className="font-medium">{suggestedAction.title}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {suggestedAction.label}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        )}

      {/* Top: Input Area */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder="Ask ROKCT..."
          value={input}
          onChange={handleInput}
          className="min-h-[24px] w-full bg-transparent border-none shadow-none resize-none focus-visible:ring-0 text-base py-2 px-1 max-h-[300px] placeholder:text-muted-foreground/70"
          rows={1}
          enableAi={false}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();

              if (isLoading) {
                toast.error("Please wait for the model to finish its response!");
              } else {
                submitForm();
              }
            }
          }}
        />

        {/* Badges Absolute Top-Right */}
        <div className="absolute top-0 right-0 pointer-events-none">
          {(() => {
            // Priority: Forced Props (Landing Page) -> Internal State (Chat)
            const effectiveIntent = forcedIntent || intent;
            const effectiveEntity = forcedEntity || details?.entity;
            const effectiveAction = forcedAction || details?.action;

            const isGreeting = details?.misc === "greeting" && details.miscScore > 0.25;
            const isUnknown = effectiveIntent === "Unknown";

            // Show badge if we have text intent OR if we are in a specific Pin Context OR if we have forced mock intent
            // Also logic: if we have separate parts, we show them.
            const hasContent = (input.trim().length > 0 || !!forcedIntent || !!activePinContext || !!effectiveEntity) && !isGreeting && !isUnknown;

            // Determine Parts
            let actionText = "";
            let entityText = "";
            let dateText = details?.dateText || "";

            if (activePinContext) {
              entityText = activePinContext;
            } else {
              if (effectiveAction) actionText = effectiveAction;

              // If we have explicit entity -> use it. If not, map intent to entity name if appropriate
              if (effectiveEntity) {
                entityText = effectiveEntity;
              } else if (effectiveIntent && effectiveIntent !== "Unknown") {
                entityText = effectiveIntent;
              }

              // Fallback for detected but not explicit
              if (!actionText && details && details.actionScore > 0.15) actionText = details.action;
              if (!entityText && details && details.entityScore > 0.15) entityText = details.entity;
            }

            return (
              <div
                className={cn(
                  "flex items-center gap-1 transition-all duration-300 ease-in-out",
                  hasContent ? "opacity-100 scale-100" : "opacity-0 scale-90"
                )}
              >
                {/* Action Badge */}
                {actionText && (
                  <Badge variant="outline" className="bg-white/80 dark:bg-black/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 capitalize">
                    {actionText}
                  </Badge>
                )}

                {/* Entity / Intent Badge */}
                {entityText && (
                  <Badge
                    variant={effectiveIntent === "Task" ? "default" : effectiveIntent === "Note" ? "secondary" : "outline"}
                    className={cn(
                      "flex items-center gap-1 capitalize",
                      // Context Mode Highlight
                      activePinContext === "competitor" && "bg-blue-600 text-white border-blue-600",
                      // Entity Colors
                      effectiveEntity === "invoice" && "bg-emerald-600 hover:bg-emerald-700 text-white border-none",
                      effectiveEntity === "order" && "bg-emerald-600 hover:bg-emerald-700 text-white border-none",
                      effectiveEntity === "quote" && "bg-blue-600 hover:bg-blue-700 text-white border-none",
                      effectiveEntity === "lead" && "bg-cyan-600 hover:bg-cyan-700 text-white border-none",
                      effectiveEntity === "opportunity" && "bg-cyan-600 hover:bg-cyan-700 text-white border-none",
                      effectiveEntity === "employee" && "bg-purple-600 hover:bg-purple-700 text-white border-none",
                      effectiveEntity === "item" && "bg-orange-600 hover:bg-orange-700 text-white border-none",
                      effectiveEntity === "project" && "bg-orange-600 hover:bg-orange-700 text-white border-none",
                      effectiveAction === "delete" && "bg-red-600 hover:bg-red-700 text-white border-none"
                    )}
                  >
                    {/* Icons based on Entity or Action */}
                    {(activePinContext === "competitor" || effectiveEntity === "competitor") ? <span className="text-xs mr-1">🏪</span> :
                      (effectiveEntity === "invoice" || effectiveEntity === "order") ? <span className="text-xs mr-1">💰</span> :
                        (effectiveEntity === "quote" || effectiveEntity === "contract") ? <span className="text-xs mr-1">📄</span> :
                          (effectiveEntity === "lead" || effectiveEntity === "employee") ? <span className="text-xs mr-1">👤</span> :
                            (effectiveEntity === "meeting" || effectiveEntity === "leave") ? <span className="text-xs mr-1">📅</span> :
                              effectiveEntity === "email" ? <span className="text-xs mr-1">✉️</span> :
                                effectiveEntity === "item" ? <span className="text-xs mr-1">📦</span> :
                                  effectiveIntent === "Task" ? <ListTodo className="h-3 w-3" /> :
                                    effectiveIntent === "Note" ? <StickyNote className="h-3 w-3" /> : null}

                    {entityText}
                  </Badge>
                )}

                {/* Date Badge */}
                {dateText && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                    {dateText}
                  </Badge>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Attachments Row */}
      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-auto px-1 py-1">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: "",
                name: filename,
                contentType: "",
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      {/* Bottom Bar: Tools (Left) | Actions (Right) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {/* Plus Menu (Dropdown) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-full size-8 p-0 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                variant="ghost"
                disabled={isLoading}
              >
                <div className="size-6 rounded-full border border-current flex items-center justify-center">
                  <span className="text-[12px] leading-none mb-0.5">+</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56" side="top">
              <DropdownMenuLabel>Add attachment</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setPendingAttachmentContext("document");
                  setTimeout(() => fileInputRef.current?.click(), 0);
                }}
                className="cursor-pointer"
              >
                <File className="mr-2 h-4 w-4" />
                <span>Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setPendingAttachmentContext("invoice");
                  setTimeout(() => fileInputRef.current?.click(), 0);
                }}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Invoice</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setPendingAttachmentContext("receipt");
                  setTimeout(() => fileInputRef.current?.click(), 0);
                }}
                className="cursor-pointer"
              >
                <Receipt className="mr-2 h-4 w-4" />
                <span>Receipt</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Smart Pin / Context Button */}
          {true && ( // Always show layout space, conditionally show content
            pinStatus === "Ready" ? (
              <Button
                className={cn(
                  "rounded-full h-8 px-3 text-xs font-medium transition-colors border-none",
                  // Style based on the Current Index Option (Active State)
                  activePinContext === "competitor" ? "bg-blue-600 text-white hover:bg-blue-700" :
                    pinOptions.length > 0 && pinOptions[pinIndex].includes("Check Out") ? "bg-orange-100 text-orange-600 hover:bg-orange-200" :
                      pinOptions.length > 0 && pinOptions[pinIndex].includes("Check In") ? "bg-green-100 text-green-600 hover:bg-green-200" :
                        "bg-transparent text-muted-foreground hover:bg-background hover:text-foreground"
                )}
                onClick={(event) => {
                  event.preventDefault();
                  handlePinClick();
                }}
                variant="ghost"
              >
                <span className="flex items-center gap-1.5">
                  <span className={cn("size-1.5 rounded-full", activePinContext ? "bg-white" : "bg-current")} />
                  {activePinContext || "Tools"}
                </span>
              </Button>
            ) : (
              <div className="h-8 w-20" /> // Spacer for loading
            )
          )}
        </div>

        <div className="flex items-center gap-1">
          <BrandLogo width={20} height={20} className="text-muted-foreground" />
          {/* Model Selector (Bottom Right) */}
          {models && models.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                  {models.find(m => m.id === selectedModelId)?.name || "Model"}
                  <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={selectedModelId} onValueChange={(val) => onModelChange?.(val)}>
                  {models.map((model) => (
                    <DropdownMenuRadioItem key={model.id} value={model.id}>
                      {model.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Submit / Mic Button */}
          {isLoading ? (
            <Button
              className="rounded-full size-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              onClick={(event) => {
                event.preventDefault();
                stop();
              }}
            >
              <StopIcon size={14} />
            </Button>
          ) : input.length > 0 ? (
            <Button
              className="rounded-full size-9 p-0 bg-white text-black hover:bg-gray-200 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-sm transition-all"
              onClick={(event) => {
                event.preventDefault();
                submitForm();
              }}
              disabled={uploadQueue.length > 0}
            >
              <ArrowUpIcon size={18} />
            </Button>
          ) : (
            <Button
              className="rounded-full size-9 p-0 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm transition-all"
              onClick={(event) => {
                event.preventDefault();
                toast.info("Voice Mode coming soon!");
              }}
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
