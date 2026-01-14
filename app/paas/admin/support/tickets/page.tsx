"use client";

import { format } from "date-fns";
import { Loader2, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getTickets, updateTicket } from "@/app/actions/paas/admin/support";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    async function fetchTickets() {
        try {
            const data = await getTickets();
            setTickets(data);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleClose = async (name: string) => {
        try {
            await updateTicket(name, { status: "Closed" });
            toast.success("Ticket closed");
            fetchTickets();
        } catch (error) {
            toast.error("Failed to close ticket");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Support Tickets</h1>

            <div className="grid gap-4">
                {tickets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No tickets found.</div>
                ) : (
                    tickets.map((ticket) => (
                        <Card key={ticket.name}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {ticket.subject}
                                </CardTitle>
                                <Badge variant={ticket.status === "Open" ? "default" : "secondary"}>
                                    {ticket.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="size-4" />
                                            <span>{ticket.user}</span>
                                        </div>
                                        <div className="mt-1">
                                            {format(new Date(ticket.creation), "PPP p")}
                                        </div>
                                    </div>
                                    {ticket.status === "Open" && (
                                        <Button size="sm" onClick={() => handleClose(ticket.name)}>
                                            Close Ticket
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
