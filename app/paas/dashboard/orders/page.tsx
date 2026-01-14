"use client";

import { Loader2, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getOrders } from "@/app/actions/paas/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Order {
    name: string;
    user: string;
    grand_total: number;
    status: string;
    creation: string;
}

const STATUSES = ["all", "New", "Accepted", "Shipped", "Delivered", "Cancelled", "Paid", "Failed"];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState("all");

    useEffect(() => {
        async function fetchOrders() {
            setLoading(true);
            try {
                const data = await getOrders(1, 20, activeStatus);
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, [activeStatus]);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Orders</h1>

            <div className="flex space-x-2 overflow-x-auto pb-2">
                {STATUSES.map((status) => (
                    <Button
                        key={status}
                        variant={activeStatus === status ? "default" : "outline"}
                        onClick={() => setActiveStatus(status)}
                        className="capitalize whitespace-nowrap"
                    >
                        {status}
                    </Button>
                ))}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    <Loader2 className="size-6 animate-spin mx-auto text-gray-500" />
                                </TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.name}>
                                    <TableCell className="font-medium">{order.name}</TableCell>
                                    <TableCell>{order.user}</TableCell>
                                    <TableCell>${order.grand_total?.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                order.status === "Delivered" || order.status === "Paid"
                                                    ? "default" // green-ish usually but default is primary
                                                    : order.status === "Cancelled" || order.status === "Failed"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                            className={cn(
                                                order.status === "Delivered" && "bg-green-500 hover:bg-green-600",
                                                order.status === "Paid" && "bg-green-500 hover:bg-green-600",
                                                order.status === "New" && "bg-blue-500 hover:bg-blue-600"
                                            )}
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(order.creation).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/dashboard/orders/${order.name}`}>
                                            <Button variant="ghost" size="icon">
                                                <Eye className="size-4" />
                                            </Button>
                                        </Link>
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
