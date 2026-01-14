"use client";

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getParcelOrders } from "@/app/actions/paas/admin/orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function ParcelOrdersPage() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            const data = await getParcelOrders();
            setOrders(data);
        } catch (error) {
            toast.error("Failed to load parcel orders");
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
                <h2 className="text-3xl font-bold tracking-tight">Parcel Orders</h2>
                <p className="text-muted-foreground">
                    View and manage parcel delivery orders.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Parcel Orders</CardTitle>
                    <CardDescription>
                        List of all parcel orders in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Delivery Date</TableHead>
                                <TableHead>Total Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.name}>
                                    <TableCell className="font-medium">{order.name}</TableCell>
                                    <TableCell>{order.user}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{order.status}</Badge>
                                    </TableCell>
                                    <TableCell>{order.delivery_date}</TableCell>
                                    <TableCell>{order.total_price}</TableCell>
                                </TableRow>
                            ))}
                            {orders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No parcel orders found.
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
