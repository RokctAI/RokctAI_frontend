"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle } from "lucide-react";
import { getCommunications, addComment, CommentData } from "@/app/actions/handson/all/workspace/communication";
import { getSessionCompanyContext } from "@/app/actions/company";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ChatPage() {
    const [messages, setMessages] = useState<CommentData[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // We link the "General" chat to the Company document "Rokct" (or whatever the main company is)
    // This allows us to use the standard Communication table without custom doctypes.
    const CHAT_CONTEXT_DOCTYPE = "Company";
    const [chatContextName, setChatContextName] = useState<string | null>(null);

    useEffect(() => {
        getSessionCompanyContext().then(ctx => {
            if (ctx && ctx.name) {
                setChatContextName(ctx.name);
            }
        });
    }, []);

    useEffect(() => {
        if (!chatContextName) return;
        loadMessages();
        // Simple polling for "realtime" feel since we don't have socket connection in this frontend wrapper yet
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, [chatContextName]);

    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const loadMessages = async () => {
        if (!chatContextName) return;
        const data = await getCommunications(CHAT_CONTEXT_DOCTYPE, chatContextName);
        setMessages(data);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        setLoading(true);
        // We use the same 'addComment' action but for the Company doc
        if (!chatContextName) return;
        const res = await addComment(CHAT_CONTEXT_DOCTYPE, chatContextName, newMessage);
        if (res.success) {
            setNewMessage("");
            loadMessages();
        } else {
            toast.error("Failed to send: " + res.error);
        }
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] p-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <MessageCircle className="h-8 w-8 text-primary" />
                    Team Chat
                </h1>
                <p className="text-muted-foreground">General channel for Company announcements and watercooler talk.</p>
            </div>

            <Card className="flex-1 flex flex-col min-h-0 bg-slate-50 border-slate-200 shadow-sm">
                <CardHeader className="py-3 px-4 border-b bg-white rounded-t-lg">
                    <CardTitle className="text-sm font-medium flex items-center text-slate-600">
                        # general-{chatContextName?.toLowerCase() || 'loading...'}
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-muted-foreground py-10 opacity-50">
                                    No messages yet. Say hello! 👋
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.name} className="flex gap-3 items-start group">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender}`} />
                                            <AvatarFallback>{msg.sender[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm text-slate-800">{msg.sender}</span>
                                                <span className="text-[10px] text-muted-foreground">{format(new Date(msg.creation), "h:mm a")}</span>
                                            </div>
                                            <div
                                                className="text-sm text-slate-700 bg-white border border-slate-100 px-3 py-2 rounded-r-lg rounded-bl-lg shadow-sm"
                                                dangerouslySetInnerHTML={{ __html: msg.content }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 bg-white border-t rounded-b-lg">
                        <div className="flex gap-2">
                            <Input
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Message #general..."
                                disabled={loading}
                                className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-offset-0"
                            />
                            <Button onClick={handleSendMessage} disabled={loading || !newMessage.trim()} size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-2 text-right">
                            * Messages are linked to the Company Document.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
