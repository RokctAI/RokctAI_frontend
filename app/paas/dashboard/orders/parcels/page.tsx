"use client";

import { Loader2, Eye, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { getParcelOrders, updateParcelStatus } from "@/app/actions/paas/parcel";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ParcelOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    async function fetchOrders() {
        setLoading(true);
        try {
            const data = await getParcelOrders();
            setOrders(data || []);
        } catch (error) {
            console.error("Error fetching parcel orders:", error);
            toast.error("Failed to fetch parcel orders");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = statusFilter === "all"
        ? orders
        : orders.filter(order => order.status === statusFilter);

    async function handleStatusUpdate(name: string, status: string) {
        try {
            await updateParcelStatus(name, status);
            toast.success(`Order status updated to ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Parcel Orders</h1>
                    <p className="text-muted-foreground">Manage your delivery requests.</p>
                </div>
                <div className="w-[200px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Accepted">Accepted</SelectItem>
                            <SelectItem value="Ready">Ready</SelectItem>
                            <SelectItem value="On a way">On a way</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Canceled">Canceled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Orders List</CardTitle>
                    <CardDescription>View and manage all parcel orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No parcel orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => (
                                    <TableRow key={order.name}>
                                        <TableCell className="font-medium">{order.name}</TableCell>
                                        <TableCell>
                                            {order.delivery_date ? format(new Date(order.delivery_date), "MMM d, yyyy") : "-"}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={order.address_to}>
                                            {order.address_to}
                                        </TableCell>
                                        <TableCell>{order.total_price}</TableCell>
                                        <TableCell>
                                            <Badge
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
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {order.status === "New" && (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleStatusUpdate(order.name, "Accepted")}
                                                            title="Accept"
                                                        >
                                                            <CheckCircle className="size-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleStatusUpdate(order.name, "Canceled")}
                                                            title="Cancel"
                                                        >
                                                            <XCircle className="size-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Link href={`/paas/dashboard/orders/parcels/${order.name}`}>
                                                    <Button variant="ghost" size="icon">
                                                        <Eye className="size-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
