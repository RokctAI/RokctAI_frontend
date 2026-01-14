"use client";

import { Loader2, ArrowLeft, Calendar, Clock, Users, Utensils, CheckCircle, XCircle, Ban } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { getReservation, updateReservationStatus } from "@/app/actions/paas/booking";
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

export default function BookingDetailsPage({ params }: { params: { id: string } }) {
    const [reservation, setReservation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchReservation() {
            try {
                const data = await getReservation(params.id);
                if (!data) {
                    toast.error("Reservation not found");
                    router.push("/paas/dashboard/bookings");
                    return;
                }
                setReservation(data);
            } catch (error) {
                console.error("Error fetching reservation:", error);
                toast.error("Failed to fetch reservation details");
            } finally {
                setLoading(false);
            }
        }
        fetchReservation();
    }, [params.id, router]);

    async function handleStatusUpdate(status: string) {
        setUpdating(true);
        try {
            await updateReservationStatus(reservation.name, status);
            toast.success(`Reservation ${status.toLowerCase()}`);
            // Refresh data
            const updated = await getReservation(params.id);
            setReservation(updated);
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

    if (!reservation) return null;

    return (
        <div className="p-8 space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/paas/dashboard/bookings">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="size-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Booking Details</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{reservation.customer_name}</CardTitle>
                            <CardDescription>Reservation ID: {reservation.name}</CardDescription>
                        </div>
                        <Badge
                            className="text-base px-3 py-1"
                            variant={
                                reservation.status === "Approved"
                                    ? "default"
                                    : reservation.status === "Rejected" || reservation.status === "Cancelled"
                                        ? "destructive"
                                        : "secondary"
                            }
                        >
                            {reservation.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="size-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Date</p>
                                <p className="text-muted-foreground">
                                    {format(new Date(reservation.booking_date), "EEEE, MMMM d, yyyy")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="size-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Time</p>
                                <p className="text-muted-foreground">{reservation.booking_time}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Users className="size-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Guests</p>
                                <p className="text-muted-foreground">{reservation.number_of_guests} People</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Utensils className="size-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Table</p>
                                <p className="text-muted-foreground">{reservation.table || "Not Assigned"}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="font-semibold mb-2">Customer Notes</h3>
                        <p className="text-muted-foreground">
                            {reservation.notes || "No notes provided."}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3">
                    {reservation.status === "Pending" && (
                        <>
                            <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleStatusUpdate("Rejected")}
                                disabled={updating}
                            >
                                <XCircle className="mr-2 size-4" />
                                Reject
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleStatusUpdate("Approved")}
                                disabled={updating}
                            >
                                <CheckCircle className="mr-2 size-4" />
                                Approve
                            </Button>
                        </>
                    )}
                    {reservation.status === "Approved" && (
                        <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleStatusUpdate("Cancelled")}
                            disabled={updating}
                        >
                            <Ban className="mr-2 size-4" />
                            Cancel Booking
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
