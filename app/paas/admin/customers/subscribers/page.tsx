"use client";

import { format } from "date-fns";
import { Loader2, Mail } from "lucide-react";
import { useEffect, useState } from "react";

import { getSubscribers } from "@/app/actions/paas/admin/customers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SubscribersPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSubscribers() {
            try {
                const data = await getSubscribers();
                setSubscribers(data);
            } catch (error) {
                console.error("Error fetching subscribers:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSubscribers();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Email Subscribers</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Subscribed On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : subscribers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                    No subscribers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            subscribers.map((sub) => (
                                <TableRow key={sub.name}>
                                    <TableCell className="flex items-center gap-2">
                                        <Mail className="size-4 text-muted-foreground" />
                                        {sub.email}
                                    </TableCell>
                                    <TableCell>{format(new Date(sub.creation), "PPP")}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
