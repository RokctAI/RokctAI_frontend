"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getDeliveries } from "@/app/actions/paas/admin/deliveryman";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DeliveriesListPage() {
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDeliveries() {
            try {
                const data = await getDeliveries();
                setDeliveries(data);
            } catch (error) {
                console.error("Error fetching deliveries:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDeliveries();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Deliveries List</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Driver</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Fee</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : deliveries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No deliveries found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            deliveries.map((delivery) => (
                                <TableRow key={delivery.name}>
                                    <TableCell className="font-medium">{delivery.name}</TableCell>
                                    <TableCell>{format(new Date(delivery.creation), "PPP")}</TableCell>
                                    <TableCell>{delivery.order}</TableCell>
                                    <TableCell>{delivery.driver_name || "Unassigned"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{delivery.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${delivery.delivery_fee?.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
