"use client";

import { format } from "date-fns";
import { Loader2, Calendar, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { getBookings } from "@/app/actions/paas/admin/orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBookings() {
            try {
                const data = await getBookings();
                setBookings(data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Bookings</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookings.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">No bookings found.</div>
                ) : (
                    bookings.map((booking) => (
                        <Card key={booking.name}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {booking.shop}
                                </CardTitle>
                                <Badge variant={booking.status === "Accepted" ? "default" : "secondary"}>
                                    {booking.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="size-4 text-muted-foreground" />
                                        <span>{format(new Date(booking.booking_date), "PPP p")}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="size-4 text-muted-foreground" />
                                        <span>{booking.number_of_guests} Guests</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        User: {booking.user}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
