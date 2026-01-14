"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getOrders } from "@/app/actions/paas/admin/orders";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ORDER_TYPES = [
    { id: "all", label: "All Orders" },
    { id: "Delivery", label: "Delivery" },
    { id: "Dine-in", label: "Dine-in" },
    { id: "Pickup", label: "Pickup" },
    { id: "Kiosk", label: "Kiosk" },
    { id: "Scheduled", label: "Scheduled" }
];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    async function fetchOrders() {
        setLoading(true);
        try {
            const data = await getOrders(1, 20, activeTab === "all" ? "" : activeTab);
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Order Management</h1>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start overflow-x-auto">
                    {ORDER_TYPES.map(type => (
                        <TabsTrigger key={type.id} value={type.id}>
                            {type.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="mt-4 rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Shop</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <Loader2 className="size-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.name}>
                                        <TableCell className="font-medium">{order.name}</TableCell>
                                        <TableCell>{format(new Date(order.creation), "PPP")}</TableCell>
                                        <TableCell>{order.shop}</TableCell>
                                        <TableCell>{order.user}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{order.order_type}</Badge>
                                        </TableCell>
                                        <TableCell>${order.grand_total.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                order.status === "Delivered" ? "default" :
                                                    order.status === "Cancelled" ? "destructive" :
                                                        "secondary"
                                            }>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Tabs>
        </div>
    );
}
