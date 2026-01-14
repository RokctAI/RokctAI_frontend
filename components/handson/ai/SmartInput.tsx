"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, ListTodo, StickyNote, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartInputProps {
    value: string;
    onChange: (value: string) => void;
    onIntentChange?: (intent: "Task" | "Note" | "Unknown") => void;
    className?: string;
    placeholder?: string;
}

export function SmartInput({ value, onChange, onIntentChange, className, placeholder }: SmartInputProps) {
    const [intent, setIntent] = useState<"Task" | "Note" | "Unknown">("Unknown");
    const [isThinking, setIsThinking] = useState(false);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Initialize Worker
        if (!workerRef.current) {
            workerRef.current = new Worker("/workers/ai-worker.js", { type: "module" });

            workerRef.current.onmessage = (e) => {
                const { status, intent: newIntent } = e.data;
                if (status === "success") {
                    setIntent(newIntent);
                    if (onIntentChange) onIntentChange(newIntent);
                    setIsThinking(false);
                }
            };
        }

        return () => {
            workerRef.current?.terminate();
        };
    }, [onIntentChange]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        if (!newValue.trim()) {
            setIntent("Unknown");
            return;
        }

        // Debounce slightly or just fire? Worker is non-blocking, so fire away.
        setIsThinking(true);
        workerRef.current?.postMessage({
            task: "classify_intent",
            text: newValue
        });
    };

    return (
        <div className={cn("relative group", className)}>
            <Textarea
                value={value}
                onChange={handleChange}
                placeholder={placeholder || "What's on your mind? (e.g. 'Meeting with John tomorrow' or 'Idea for new logo')"}
                className="pr-24 min-h-[100px] resize-none transition-all focus:min-h-[120px]"
            />

            <div className="absolute bottom-2 right-2 flex items-center gap-2 pointer-events-none">
                {isThinking && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}

                <Badge
                    variant={intent === "Task" ? "default" : intent === "Note" ? "secondary" : "outline"}
                    className={cn(
                        "transition-all duration-300 ease-in-out",
                        intent === "Unknown" && !value && "opacity-0"
                    )}
                >
                    {intent === "Task" && <ListTodo className="h-3 w-3 mr-1" />}
                    {intent === "Note" && <StickyNote className="h-3 w-3 mr-1" />}
                    {intent === "Unknown" && <Brain className="h-3 w-3 mr-1" />}
                    {intent}
                </Badge>
            </div>
        </div>
    );
}
