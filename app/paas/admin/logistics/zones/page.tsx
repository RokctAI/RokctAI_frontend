"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getDeliveryZones } from "@/app/actions/paas/admin/logistics";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminZonesPage() {
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchZones() {
            try {
                const data = await getDeliveryZones();
                setZones(data);
            } catch (error) {
                console.error("Error fetching zones:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchZones();
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
            <h1 className="text-3xl font-bold">Delivery Zones</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Zone Name</TableHead>
                            <TableHead>Shop</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {zones.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center h-24">
                                    No delivery zones found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            zones.map((zone) => (
                                <TableRow key={zone.name}>
                                    <TableCell className="font-medium">
                                        {zone.name}
                                    </TableCell>
                                    <TableCell>
                                        {zone.shop}
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
