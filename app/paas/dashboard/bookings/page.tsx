"use client";

import { Loader2, Eye, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { getReservations, updateReservationStatus } from "@/app/actions/paas/booking";
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

interface Reservation {
    name: string;
    customer_name: string;
    booking_date: string;
    booking_time: string;
    number_of_guests: number;
    status: string;
    table?: string;
}

export default function BookingsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchReservations() {
        setLoading(true);
        try {
            const data = await getReservations();
            setReservations(data || []);
        } catch (error) {
            console.error("Error fetching reservations:", error);
            toast.error("Failed to fetch reservations");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReservations();
    }, []);

    async function handleStatusUpdate(name: string, status: string) {
        try {
            await updateReservationStatus(name, status);
            toast.success(`Reservation ${status.toLowerCase()}`);
            fetchReservations();
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
                    <h1 className="text-3xl font-bold">Reservations</h1>
                    <p className="text-muted-foreground">Manage your table bookings.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>View and manage all reservation requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Guests</TableHead>
                                <TableHead>Table</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No reservations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reservations.map((res) => (
                                    <TableRow key={res.name}>
                                        <TableCell className="font-medium">{res.customer_name}</TableCell>
                                        <TableCell>
                                            {format(new Date(res.booking_date), "MMM d, yyyy")} at {res.booking_time}
                                        </TableCell>
                                        <TableCell>{res.number_of_guests}</TableCell>
                                        <TableCell>{res.table || "-"}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    res.status === "Approved"
                                                        ? "default" // default is usually primary/black
                                                        : res.status === "Rejected" || res.status === "Cancelled"
                                                            ? "destructive"
                                                            : "secondary"
                                                }
                                            >
                                                {res.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {res.status === "Pending" && (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleStatusUpdate(res.name, "Approved")}
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="size-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleStatusUpdate(res.name, "Rejected")}
                                                            title="Reject"
                                                        >
                                                            <XCircle className="size-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Link href={`/paas/dashboard/bookings/${res.name}`}>
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
