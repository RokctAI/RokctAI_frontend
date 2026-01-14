"use client";

import { format } from "date-fns";
import { Loader2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getReservations, updateReservationStatus } from "@/app/actions/paas/booking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    async function fetchData() {
        setLoading(true);
        try {
            const status = statusFilter === "all" ? undefined : statusFilter;
            const data = await getReservations(status);
            setReservations(data);
        } catch (error) {
            console.error("Error fetching reservations:", error);
            toast.error("Failed to load reservations");
        } finally {
            setLoading(false);
        }
    }

    const handleStatusUpdate = async (name: string, newStatus: string) => {
        try {
            await updateReservationStatus(name, newStatus);
            toast.success(`Reservation ${newStatus.toLowerCase()} successfully`);
            fetchData();
        } catch (error) {
            console.error("Error updating reservation:", error);
            toast.error("Failed to update reservation status");
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Reservations</h1>
                    <p className="text-muted-foreground">Manage table reservations for your shop.</p>
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
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reservation List</CardTitle>
                    <CardDescription>View and manage customer bookings.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="size-8 animate-spin text-gray-500" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Table</TableHead>
                                    <TableHead>Guests</TableHead>
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
                                            <TableCell>
                                                <div className="font-medium">{format(new Date(res.start_date), 'MMM d, yyyy')}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(res.start_date), 'HH:mm')} - {format(new Date(res.end_date), 'HH:mm')}
                                                </div>
                                            </TableCell>
                                            <TableCell>{res.user}</TableCell>
                                            <TableCell>{res.table}</TableCell>
                                            <TableCell>{res.guest_number}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    res.status === 'Accepted' ? 'default' :
                                                        res.status === 'Rejected' || res.status === 'Cancelled' ? 'destructive' :
                                                            'secondary'
                                                }>
                                                    {res.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {res.status === 'New' && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusUpdate(res.name, 'Accepted')}>
                                                            <Check className="size-4 mr-1" /> Accept
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleStatusUpdate(res.name, 'Rejected')}>
                                                            <X className="size-4 mr-1" /> Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
