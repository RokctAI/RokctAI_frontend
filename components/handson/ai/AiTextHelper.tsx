
"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Check, X, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AiTextHelperProps {
    text: string;
    onAccept: (newText: string) => void;
    className?: string;
}

export function AiTextHelper({ text, onAccept, className }: AiTextHelperProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState<string | null>(null);
    const [customPrompt, setCustomPrompt] = useState("");
    const [mode, setMode] = useState<"menu" | "custom" | "result">("menu");

    const handleGenerate = async (
        type: "grammar" | "professional" | "expand" | "custom",
        prompt?: string
    ) => {
        if (!text) {
            toast.error("Please enter some text first.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/ai/text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    promptType: type,
                    customPrompt: prompt,
                }),
            });

            if (response.status === 403) {
                toast.error("Upgrade Required", {
                    description: "This feature is available on the Pro plan.",
                    action: {
                        label: "Upgrade",
                        onClick: () => window.location.href = "/settings/billing" // Example link
                    }
                });
                setLoading(false);
                return;
            }

            if (response.status === 402) {
                toast.error("Quota Exceeded", {
                    description: "You have used all your AI tokens for today.",
                });
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to generate text");
            }

            const data = await response.json();
            setGeneratedText(data.text);
            setMode("result");
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const accept = () => {
        if (generatedText) {
            onAccept(generatedText);
            reset();
        }
    };

    const [quotaExceeded, setQuotaExceeded] = useState(false);

    useEffect(() => {
        const checkQuota = async () => {
            try {
                const res = await fetch("/api/ai/quota");
                if (res.ok) {
                    const data = await res.json();
                    if (data.allowed === false) {
                        setQuotaExceeded(true);
                    }
                }
            } catch (e) {
                console.error("Quota check failed", e);
            }
        };
        checkQuota();
    }, []);

    const reset = () => {
        setIsOpen(false);
        setGeneratedText(null);
        setMode("menu");
        setCustomPrompt("");
    };

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            if (quotaExceeded && open) {
                toast.error("Quota Exceeded", { description: "You have used all your AI tokens for today." });
                return;
            }
            setIsOpen(open);
            if (!open) setTimeout(() => reset(), 200);
        }}>
            <PopoverTrigger asChild>
                <div className="inline-block relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 text-muted-foreground hover:text-primary ${className} ${quotaExceeded ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={quotaExceeded ? "Quota Exceeded" : "AI Assistant"}
                        disabled={quotaExceeded}
                    >
                        <Sparkles className="h-4 w-4" />
                    </Button>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-8 space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Magic in progress...</p>
                    </div>
                ) : mode === "result" ? (
                    <div className="p-4 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-muted-foreground">Original</Label>
                            <div className="text-sm border-l-2 border-red-200 pl-2 opacity-70 line-clamp-3">
                                {text}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-primary">Generated</Label>
                            <div className="text-sm bg-muted/50 p-2 rounded-md border-l-2 border-green-400">
                                {generatedText}
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => setMode("menu")}>
                                Discard
                            </Button>
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={accept}>
                                <Check className="mr-2 h-3 w-3" />
                                Replace
                            </Button>
                        </div>
                    </div>
                ) : mode === "custom" ? (
                    <div className="p-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Custom Instruction</h4>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setMode("menu")}>
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        <Input
                            placeholder="e.g. Translate to Spanish..."
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="text-sm"
                            autoFocus
                        />
                        <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleGenerate("custom", customPrompt)}
                            disabled={!customPrompt.trim()}
                        >
                            <Wand2 className="mr-2 h-3 w-3" /> Generate
                        </Button>
                    </div>
                ) : (
                    <div className="p-1">
                        <div className="grid gap-1">
                            <Button variant="ghost" className="justify-start h-8 px-2 text-sm" onClick={() => handleGenerate("grammar")}>
                                <span className="mr-2">📝</span> Fix Grammar
                            </Button>
                            <Button variant="ghost" className="justify-start h-8 px-2 text-sm" onClick={() => handleGenerate("professional")}>
                                <span className="mr-2">👔</span> Make Professional
                            </Button>
                            <Button variant="ghost" className="justify-start h-8 px-2 text-sm" onClick={() => handleGenerate("expand")}>
                                <span className="mr-2">➕</span> Expand Text
                            </Button>
                            <Button variant="ghost" className="justify-start h-8 px-2 text-sm" onClick={() => setMode("custom")}>
                                <span className="mr-2">✨</span> Custom...
                            </Button>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
