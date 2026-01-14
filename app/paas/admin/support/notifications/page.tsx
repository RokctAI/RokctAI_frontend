"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getNotifications } from "@/app/actions/paas/admin/support";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const data = await getNotifications();
                setNotifications(data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">System Notifications</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Document</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {notifications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No notifications found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            notifications.map((notif) => (
                                <TableRow key={notif.name}>
                                    <TableCell>{format(new Date(notif.creation), "PPP p")}</TableCell>
                                    <TableCell className="font-medium">{notif.subject}</TableCell>
                                    <TableCell>{notif.for_user}</TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground">
                                            {notif.document_type}: {notif.document_name}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
