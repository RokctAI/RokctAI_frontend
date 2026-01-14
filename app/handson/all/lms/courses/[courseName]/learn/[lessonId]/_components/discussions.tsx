"use client";

import { useEffect, useState } from "react";
import { fetchDiscussionTopics, createDiscussionTopicAction, fetchDiscussionReplies, createDiscussionReplyAction } from "@/app/actions/handson/all/lms/discussions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MessageSquare, Plus } from "lucide-react";
import { formatDate } from "@/app/lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface DiscussionsProps {
    doctype: string;
    docname: string;
    title?: string;
}

export function Discussions({ doctype, docname, title = "Discussions" }: DiscussionsProps) {
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadTopics();
    }, [doctype, docname]);

    async function loadTopics() {
        setLoading(true);
        try {
            const data = await fetchDiscussionTopics(doctype, docname);
            if (Array.isArray(data)) {
                setTopics(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        if (!newTopicTitle.trim()) return;
        setSubmitting(true);
        try {
            const res = await createDiscussionTopicAction(doctype, docname, newTopicTitle);
            if (res.success) {
                toast.success("Discussion started");
                setNewTopicTitle("");
                setOpen(false);
                loadTopics();
            } else {
                toast.error("Failed to create topic: " + res.error);
            }
        } catch (err) {
            toast.error("Failed to create topic");
        } finally {
            setSubmitting(false);
        }
    }

    /* 
       NOTE: The Vue app has `DiscussionReplies` component which handles replies.
       For this MVP, we only show Top-Level Topics. 
       Full nested threading (replies) would require another level of fetching/components.
       We will list topics and let the user see them. 
       If topics are missing, this might be because we need `single_thread=true` or similar based on usage.
    */

    return (
        <div className="space-y-4 mt-8 pt-8 border-t">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" /> {title}
                </h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" /> New Topic
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Start a Discussion</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Topic Title</Label>
                                <Input
                                    value={newTopicTitle}
                                    onChange={(e) => setNewTopicTitle(e.target.value)}
                                    placeholder="What do you want to discuss?"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={submitting}>
                                {submitting ? "Posting..." : "Post Topic"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="text-sm text-muted-foreground">Loading discussions...</div>
            ) : topics.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg text-muted-foreground">
                    No discussions yet. Be the first to start one!
                </div>
            ) : (
                <div className="space-y-4">
                    {topics.map((topic) => (
                        <DiscussionThread key={topic.name} topic={topic} />
                    ))}
                </div>
            )}
        </div>
    );
}

function DiscussionThread({ topic }: { topic: any }) {
    const [replies, setReplies] = useState<any[]>([]);
    const [showReplies, setShowReplies] = useState(false);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function loadReplies() {
        if (showReplies) {
            setShowReplies(false);
            return;
        }
        setLoadingReplies(true);
        setShowReplies(true);
        try {
            const data = await fetchDiscussionReplies(topic.name);
            setReplies(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingReplies(false);
        }
    }

    async function handleReply() {
        if (!replyText.trim()) return;
        setSubmitting(true);
        try {
            const res = await createDiscussionReplyAction(topic.name, replyText);
            if (res.success) {
                toast.success("Reply posted");
                setReplyText("");
                // Reload
                const data = await fetchDiscussionReplies(topic.name);
                setReplies(data);
            } else {
                toast.error("Failed: " + res.error);
            }
        } catch (e) {
            toast.error("Error posting reply");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Card>
            <CardContent className="p-4 flex gap-4">
                <Avatar>
                    <AvatarImage src={topic.user_image} />
                    <AvatarFallback>{topic.owner?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <div className="font-semibold">{topic.title}</div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                        <span>{topic.owner}</span>
                        <span>•</span>
                        <span>{formatDate(topic.creation)}</span>
                    </div>

                    <div className="pt-2">
                        <Button variant="ghost" size="sm" onClick={loadReplies} className="text-xs h-auto p-0 hover:bg-transparent text-primary">
                            {showReplies ? "Hide Replies" : "View Replies"}
                        </Button>
                    </div>

                    {showReplies && (
                        <div className="space-y-4 pt-4 border-t mt-2">
                            {loadingReplies ? (
                                <div className="text-xs text-muted-foreground">Loading...</div>
                            ) : replies.length === 0 ? (
                                <div className="text-xs text-muted-foreground">No replies yet.</div>
                            ) : (
                                <div className="space-y-4 pl-4 border-l-2">
                                    {replies.map(reply => (
                                        <div key={reply.name} className="flex gap-3">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={reply.user?.user_image} />
                                                <AvatarFallback className="text-[10px]">{reply.owner?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-sm bg-muted/50 p-2 rounded-md">
                                                    <div className="text-xs font-semibold mb-1 text-muted-foreground flex justify-between gap-4">
                                                        <span>{reply.user?.full_name || reply.owner}</span>
                                                        <span>{formatDate(reply.creation)}</span>
                                                    </div>
                                                    <div className="text-sm" dangerouslySetInnerHTML={{ __html: reply.reply }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2 items-start pt-2">
                                <Input
                                    placeholder="Write a reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="h-8 text-sm"
                                />
                                <Button size="sm" disabled={submitting} onClick={handleReply} className="h-8">
                                    Reply
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

