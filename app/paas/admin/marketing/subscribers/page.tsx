"use client";

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getEmailSubscribers } from "@/app/actions/paas/admin/marketing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function EmailSubscribersPage() {
    const [loading, setLoading] = useState(true);
    const [subscribers, setSubscribers] = useState<any[]>([]);

    useEffect(() => {
        loadSubscribers();
    }, []);

    async function loadSubscribers() {
        try {
            const data = await getEmailSubscribers();
            setSubscribers(data);
        } catch (error) {
            toast.error("Failed to load email subscribers");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="size-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Email Subscribers</h2>
                <p className="text-muted-foreground">
                    View list of email newsletter subscribers.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Subscribers</CardTitle>
                    <CardDescription>
                        List of all email subscribers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Subscribed Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscribers.map((sub) => (
                                <TableRow key={sub.name}>
                                    <TableCell className="font-medium">{sub.email}</TableCell>
                                    <TableCell>{new Date(sub.creation).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                            {subscribers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                        No subscribers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
