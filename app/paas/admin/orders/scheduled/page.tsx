"use client";

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getBookings } from "@/app/actions/paas/admin/orders";
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

export default function ScheduledOrdersPage() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        loadBookings();
    }, []);

    async function loadBookings() {
        try {
            const data = await getBookings();
            setBookings(data);
        } catch (error) {
            toast.error("Failed to load scheduled orders");
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
                <h2 className="text-3xl font-bold tracking-tight">Scheduled Orders</h2>
                <p className="text-muted-foreground">
                    View and manage scheduled orders and bookings.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>
                        List of all bookings and scheduled orders.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Shop</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Guests</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.map((booking) => (
                                <TableRow key={booking.name}>
                                    <TableCell className="font-medium">{booking.name}</TableCell>
                                    <TableCell>{booking.user}</TableCell>
                                    <TableCell>{booking.shop}</TableCell>
                                    <TableCell>{booking.booking_date}</TableCell>
                                    <TableCell>{booking.number_of_guests}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{booking.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {bookings.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No scheduled orders found.
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
