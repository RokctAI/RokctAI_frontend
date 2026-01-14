"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getOrderStatuses } from "@/app/actions/paas/admin/orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function OrderStatusSettingsPage() {
    const [statuses, setStatuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStatuses() {
            try {
                const data = await getOrderStatuses();
                setStatuses(data);
            } catch (error) {
                console.error("Error fetching order statuses:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStatuses();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Order Status Settings</h1>
            <p className="text-muted-foreground">Manage the available statuses for orders.</p>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status Name</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Active</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : statuses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No order statuses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            statuses.map((status) => (
                                <TableRow key={status.name}>
                                    <TableCell className="font-medium">{status.status}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="size-4 rounded-full border"
                                                style={{ backgroundColor: status.color || '#ccc' }}
                                            />
                                            {status.color}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={status.active ? "default" : "secondary"}>
                                            {status.active ? "Active" : "Inactive"}
                                        </Badge>
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
