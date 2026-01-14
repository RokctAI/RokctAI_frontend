"use client";

import { format } from "date-fns";
import { Loader2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getDeliverymanRequests, updateDeliverymanRequest } from "@/app/actions/paas/admin/deliveryman";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DeliverymanRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        try {
            const data = await getDeliverymanRequests();
            setRequests(data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusUpdate(name: string, status: string) {
        try {
            await updateDeliverymanRequest(name, status);
            toast.success(`Request ${status.toLowerCase()} successfully`);
            fetchRequests();
        } catch (error) {
            toast.error("Failed to update request");
        }
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Deliveryman Requests</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No pending requests.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req) => (
                                <TableRow key={req.name}>
                                    <TableCell className="font-medium">{req.full_name}</TableCell>
                                    <TableCell>{req.email}</TableCell>
                                    <TableCell>{req.phone}</TableCell>
                                    <TableCell>{format(new Date(req.creation), "PPP")}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            req.status === "Approved" ? "default" :
                                                req.status === "Rejected" ? "destructive" :
                                                    "secondary"
                                        }>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === "Pending" && (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleStatusUpdate(req.name, "Approved")}
                                                >
                                                    <Check className="size-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleStatusUpdate(req.name, "Rejected")}
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        )}
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
