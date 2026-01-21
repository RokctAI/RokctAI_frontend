"use client";

import React, { useEffect, useState, useRef } from "react";
import {
    RefreshCw,
    Send,
    MessageSquare,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
    getJulesStatus,
    getJulesActivities,
    voteOnPlan,
    sendJulesMessage
} from "@/app/actions/handson/all/roadmap/roadmap";

interface JulesInteractiveProps {
    sessionId: string;
    apiKey?: string;
    featureName?: string;
}

export function JulesInteractive({ sessionId, apiKey, featureName }: JulesInteractiveProps) {
    const [status, setStatus] = useState<string>("Loading...");
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Fetch
    useEffect(() => {
        fetchData();
    }, [sessionId]);

    // Scroll to bottom on new activities
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activities]);

    async function fetchData() {
        setLoading(true);
        try {
            const [statusData, activitiesData] = await Promise.all([
                getJulesStatus(sessionId, apiKey),
                getJulesActivities(sessionId, apiKey)
            ]);

            if (statusData && statusData.state) {
                setStatus(statusData.state);
            }
            if (activitiesData) {
                // Filter and sort activities if needed, for now raw list
                setActivities(activitiesData);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch Jules data");
        } finally {
            setLoading(false);
        }
    }

    async function handleApprovePlan() {
        try {
            await voteOnPlan(sessionId, "approve", apiKey);
            toast.success("Plan Approved! Jules is resuming work.");
            fetchData(); // Refresh state immediately
        } catch (error) {
            toast.error("Failed to approve plan");
        }
    }

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            await sendJulesMessage(sessionId, message, apiKey);
            setMessage("");
            toast.success("Message sent");
            // small delay to allow backend to process
            setTimeout(fetchData, 2000);
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    }

    // Helper to format activity
    const renderActivity = (act: any) => {
        const isUser = act.originator === "user" || !!act.userMessaged;
        const isAgent = act.originator === "agent" || !!act.agentMessaged;
        const isPlan = !!act.planGenerated;

        let content = act.description || "Unknown Activity";

        if (act.userMessaged) content = act.userMessaged.message;
        if (act.agentMessaged) content = act.agentMessaged.message;

        return (
            <div key={act.id || Math.random()} className={`flex flex-col gap-1 mb-4 ${isUser ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${isUser
                        ? "bg-primary text-primary-foreground"
                        : isAgent
                            ? "bg-muted"
                            : "bg-secondary text-secondary-foreground border border-border"
                    }`}>
                    {isPlan && <Badge variant="outline" className="mb-2 bg-background">Plan Generated</Badge>}
                    <p className="whitespace-pre-wrap">{content}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">
                    {act.createTime ? new Date(act.createTime).toLocaleTimeString() : ""}
                </span>
            </div>
        );
    };

    return (
        <Card className="flex flex-col h-[500px] w-full border-t">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${status === "IN_PROGRESS" ? "bg-green-500 animate-pulse" :
                            status === "AWAITING_PLAN_APPROVAL" ? "bg-amber-500 animate-bounce" :
                                status === "COMPLETED" ? "bg-blue-500" : "bg-slate-400"
                        }`} />
                    <span className="font-semibold text-sm">Session Status: {status}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading} className="h-8 w-8 p-0">
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
            </div>

            {/* Approval Banner */}
            {status === "AWAITING_PLAN_APPROVAL" && (
                <Alert variant="warning" className="m-4 border-amber-200 bg-amber-50 text-amber-900 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>Approval Required</AlertTitle>
                    <AlertDescription className="flex items-center justify-between mt-1">
                        <span>Jules has generated a plan and is waiting for your approval.</span>
                        <Button size="sm" onClick={handleApprovePlan} className="bg-amber-600 hover:bg-amber-700 text-white border-none">
                            <CheckCircle2 className="mr-2 h-3 w-3" /> Approve Plan
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 gap-2 mt-10">
                        <MessageSquare className="h-8 w-8" />
                        <p>No activity yet.</p>
                    </div>
                ) : (
                    activities.map(renderActivity)
                )}
            </ScrollArea>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-background flex gap-2">
                <Input
                    placeholder="Type a message to Jules..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={sending || status === "COMPLETED" || status === "FAILED"}
                    className="flex-1"
                />
                <Button type="submit" size="icon" disabled={sending || !message.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </Card>
    );
}
