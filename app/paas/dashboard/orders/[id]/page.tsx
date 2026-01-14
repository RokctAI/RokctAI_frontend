"use client";

import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getOrder, updateOrderStatus } from "@/app/actions/paas/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface OrderItem {
    item_code: string;
    item_name: string;
    qty: number;
    rate: number;
    amount: number;
}

interface Order {
    name: string;
    user: string;
    grand_total: number;
    status: string;
    creation: string;
    delivery_address: string;
    items: OrderItem[]; // Assuming items are returned, might need to check API
    // Add other fields as needed
}

const STATUSES = ["New", "Accepted", "Shipped", "Delivered", "Cancelled", "Paid", "Failed"];

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [order, setOrder] = useState<any>(null); // Type as any for now to avoid strict checks on missing fields
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        async function fetchOrder() {
            try {
                const data = await getOrder(params.id);
                if (data) {
                    setOrder(data);
                    setStatus(data.status);
                } else {
                    toast.error("Order not found");
                    router.push("/paas/dashboard/orders");
                }
            } catch (error) {
                console.error("Error fetching order:", error);
                toast.error("Failed to load order");
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [params.id, router]);

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true);
        try {
            await updateOrderStatus(params.id, newStatus);
            setStatus(newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            // Refresh order data
            const updatedOrder = await getOrder(params.id);
            setOrder(updatedOrder);
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/paas/dashboard/orders">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Order #{order.name}</h1>
                        <p className="text-muted-foreground">
                            Placed on {new Date(order.creation).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={updating}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items?.map((item: any) => (
                                        <TableRow key={item.item_code}>
                                            <TableCell>
                                                <div className="font-medium">{item.item_name || item.item_code}</div>
                                                <div className="text-sm text-muted-foreground">{item.item_code}</div>
                                            </TableCell>
                                            <TableCell className="text-right">{item.qty}</TableCell>
                                            <TableCell className="text-right">${item.rate?.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">${item.amount?.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="font-medium">User</div>
                                <div className="text-sm text-muted-foreground">{order.user}</div>
                            </div>
                            <div>
                                <div className="font-medium">Delivery Address</div>
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {order.delivery_address || "No address provided"}
                                </div>
                            </div>
                            <div>
                                <div className="font-medium">Contact</div>
                                <div className="text-sm text-muted-foreground">
                                    {order.phone || "No phone provided"}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${(order.grand_total - (order.delivery_fee || 0) - (order.tax || 0)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery Fee</span>
                                <span>${order.delivery_fee?.toFixed(2) || "0.00"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span>${order.tax?.toFixed(2) || "0.00"}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                <span>Total</span>
                                <span>${order.grand_total?.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
