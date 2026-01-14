"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createIssue, updateIssue, IssueData } from "@/app/actions/handson/all/crm/support/issue";
import { toast } from "sonner";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCommunications, addComment, CommentData } from "@/app/actions/handson/all/workspace/communication";
import { format } from "date-fns";

export function IssueForm({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form States
    const [subject, setSubject] = useState(initialData?.subject || "");
    const [status, setStatus] = useState(initialData?.status || "Open");
    const [priority, setPriority] = useState<any>(initialData?.priority || "Medium");
    const [description, setDescription] = useState(initialData?.description || "");
    const [raisedBy, setRaisedBy] = useState(initialData?.raised_by || "");

    // Chat States
    const [comments, setComments] = useState<CommentData[]>([]);
    const [newComment, setNewComment] = useState("");
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        if (isEdit && initialData?.name) {
            loadComments();
        }
    }, [isEdit, initialData]);

    const loadComments = async () => {
        if (!initialData?.name) return;
        const data = await getCommunications("Issue", initialData.name);
        setComments(data);
    };

    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        setChatLoading(true);
        const res = await addComment("Issue", initialData.name, newComment);
        if (res.success) {
            toast.success("Reply posted");
            setNewComment("");
            loadComments();
        } else {
            toast.error(res.error);
        }
        setChatLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload: IssueData = { subject, status, priority, description, raised_by: raisedBy };

        let res;
        if (isEdit) res = await updateIssue(initialData.name, payload);
        else res = await createIssue(payload);

        setLoading(false);
        if (res.success) {
            toast.success(isEdit ? "Issue Updated" : "Issue Created");
            router.push("/handson/all/commercial/support/issue");
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between">
                    <div className="flex gap-4 items-center">
                        <Link href="/handson/all/commercial/support/issue"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                        <h1 className="text-2xl font-bold">{isEdit ? `Issue ${initialData.name}` : "New Issue"}</h1>
                    </div>
                    <Button type="submit" disabled={loading}><Save className="mr-2 h-4 w-4" /> Save Details</Button>
                </div>
                <Card>
                    <CardHeader><CardTitle>Ticket Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Subject</Label>
                            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary of the issue..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="Replied">Replied</SelectItem>
                                        <SelectItem value="Hold">Hold</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Priority</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Raised By (Email)</Label>
                            <Input value={raisedBy} onChange={e => setRaisedBy(e.target.value)} placeholder="customer@example.com" />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Detailed explanation..." />
                        </div>
                    </CardContent>
                </Card>
            </form>

            {/* Conversation Section */}
            {isEdit && (
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" /> Discussion
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Timeline */}
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {comments.length === 0 ? (
                                <p className="text-center text-muted-foreground italic text-sm">No comments yet.</p>
                            ) : (
                                comments.map((c) => (
                                    <div key={c.name} className="flex flex-col gap-1 bg-white p-3 rounded-lg border shadow-sm">
                                        <div className="flex justify-between items-start text-xs text-muted-foreground">
                                            <span className="font-semibold text-slate-700">{c.sender}</span>
                                            <span>{format(new Date(c.creation), "MMM d, h:mm a")}</span>
                                        </div>
                                        {/* Render HTML content safely since Frappe stores comments as HTML */}
                                        <div
                                            className="text-sm prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: c.content }}
                                        />
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Reply Box */}
                        <div className="flex gap-4 items-start pt-4 border-t">
                            <Textarea
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Type your reply here..."
                                className="min-h-[80px] bg-white"
                            />
                            <Button onClick={handleSendComment} disabled={chatLoading || !newComment.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
