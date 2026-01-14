"use client";

import { Loader2, ArrowLeft, MapPin, Phone, User, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { getParcelOrder, updateParcelStatus } from "@/app/actions/paas/parcel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ParcelOrderDetailsPage({ params }: { params: { id: string } }) {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchOrder() {
            try {
                const data = await getParcelOrder(params.id);
                if (!data) {
                    toast.error("Order not found");
                    router.push("/paas/dashboard/orders/parcels");
                    return;
                }
                setOrder(data);
            } catch (error) {
                console.error("Error fetching order:", error);
                toast.error("Failed to fetch order details");
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [params.id, router]);

    async function handleStatusUpdate(status: string) {
        setUpdating(true);
        try {
            await updateParcelStatus(order.name, status);
            toast.success(`Order status updated to ${status}`);
            // Refresh data
            const updated = await getParcelOrder(params.id);
            setOrder(updated);
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setUpdating(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (!order) return null;

    // Define next logical status
    let nextStatus = null;
    if (order.status === "New") nextStatus = "Accepted";
    else if (order.status === "Accepted") nextStatus = "Ready";
    else if (order.status === "Ready") nextStatus = "On a way";
    else if (order.status === "On a way") nextStatus = "Delivered";

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/paas/dashboard/orders/parcels">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="size-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Order Details</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Details */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl">Order #{order.name}</CardTitle>
                                <CardDescription>
                                    Placed on {format(new Date(order.creation), "MMM d, yyyy 'at' HH:mm")}
                                </CardDescription>
                            </div>
                            <Badge
                                className="text-base px-3 py-1"
                                variant={
                                    order.status === "Delivered"
                                        ? "default"
                                        : order.status === "Canceled"
                                            ? "destructive"
                                            : "secondary"
                                }
                            >
                                {order.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Route Info */}
                        <div className="grid gap-4 border rounded-lg p-4 bg-muted/20">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <div className="size-2 rounded-full bg-green-500 ring-4 ring-green-100" />
                                    <div className="w-0.5 h-full bg-gray-200 mx-auto my-1 min-h-[40px]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pickup From</p>
                                    <p className="font-medium">{order.username_from}</p>
                                    <p className="text-sm">{order.phone_from}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {typeof order.address_from === 'string' && order.address_from.startsWith('{')
                                            ? JSON.parse(order.address_from).address
                                            : order.address_from}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <div className="size-2 rounded-full bg-red-500 ring-4 ring-red-100" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Deliver To</p>
                                    <p className="font-medium">{order.username_to}</p>
                                    <p className="text-sm">{order.phone_to}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {typeof order.address_to === 'string' && order.address_to.startsWith('{')
                                            ? JSON.parse(order.address_to).address
                                            : order.address_to}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Parcel Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Package className="size-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Type</p>
                                    <p className="text-muted-foreground">{order.parcel_type || "Standard"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="size-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Delivery Time</p>
                                    <p className="text-muted-foreground">
                                        {order.delivery_date ? format(new Date(order.delivery_date), "MMM d") : "ASAP"}
                                        {order.delivery_time ? ` at ${order.delivery_time}` : ""}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {order.note && (
                            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 text-yellow-800 text-sm">
                                <span className="font-semibold">Note:</span> {order.note}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 bg-muted/10 p-6">
                        {order.status !== "Canceled" && order.status !== "Delivered" && (
                            <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleStatusUpdate("Canceled")}
                                disabled={updating}
                            >
                                <XCircle className="mr-2 size-4" />
                                Cancel Order
                            </Button>
                        )}

                        {nextStatus && (
                            <Button
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => handleStatusUpdate(nextStatus)}
                                disabled={updating}
                            >
                                <CheckCircle className="mr-2 size-4" />
                                Mark as {nextStatus}
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery Fee</span>
                                <span>{order.currency} {order.delivery_fee}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span>{order.currency} {order.tax}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{order.currency} {order.total_price}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {order.delivery_man && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Delivery Agent</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="size-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-medium">{order.delivery_man}</p>
                                    <p className="text-xs text-muted-foreground">ID: {order.delivery_man}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
