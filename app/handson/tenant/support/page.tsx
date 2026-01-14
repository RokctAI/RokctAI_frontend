"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LifeBuoy, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { submitProviderTicket, getProviderTickets, ProviderTicketData } from "@/app/actions/handson/tenant/support/support";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function TenantSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form
    const [subject, setSubject] = useState("");
    const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
    const [description, setDescription] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const data = await getProviderTickets();
        setTickets(data);
        setLoading(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const res = await submitProviderTicket({ subject, description, priority });
        setSubmitting(false);

        if (res.success) {
            toast.success("Support Ticket Raised");
            setSubject("");
            setDescription("");
            setPriority("Medium");
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                    <LifeBuoy className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Contact Provider Support</h1>
                    <p className="text-muted-foreground">Need help with the system? Raise a ticket directly to the SaaS team.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Previous Tickets List */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold">Your Support History</h2>
                    {loading ? (
                        <div className="text-muted-foreground">Loading tickets...</div>
                    ) : tickets.length === 0 ? (
                        <Card className="bg-slate-50 border-dashed">
                            <CardContent className="py-10 text-center text-muted-foreground">
                                No support tickets raised yet.
                            </CardContent>
                        </Card>
                    ) : (
                        tickets.map((t) => (
                            <Card key={t.name}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">{t.subject.replace("[Tenant: Rokct] ", "")}</CardTitle>
                                            <CardDescription className="text-xs">
                                                {format(new Date(t.creation), "MMM d, h:mm a")} • {t.name}
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant={t.status === "Open" ? "destructive" : "secondary"}>{t.status}</Badge>
                                            <span className="text-[10px] text-muted-foreground text-right">Priority: {t.priority}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))
                    )}
                </div>

                {/* New Ticket Form */}
                <div>
                    <Card className="border-t-4 border-t-blue-600 shadow-md">
                        <CardHeader>
                            <CardTitle>New Request</CardTitle>
                            <CardDescription>Describe your issue in detail.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label>Subject</Label>
                                    <Input
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        placeholder="e.g. Cannot access Reports..."
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Priority</Label>
                                    <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Steps to reproduce..."
                                        rows={5}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                                    {submitting ? "Sending..." : <><Send className="mr-2 h-4 w-4" /> Submit Request</>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
