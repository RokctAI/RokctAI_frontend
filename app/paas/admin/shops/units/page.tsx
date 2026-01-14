"use client";

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getShopUnits } from "@/app/actions/paas/admin/shops";
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

export default function ShopUnitsPage() {
    const [loading, setLoading] = useState(true);
    const [units, setUnits] = useState<any[]>([]);

    useEffect(() => {
        loadUnits();
    }, []);

    async function loadUnits() {
        try {
            const data = await getShopUnits();
            setUnits(data);
        } catch (error) {
            toast.error("Failed to load shop units");
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
                <h2 className="text-3xl font-bold tracking-tight">Shop Units</h2>
                <p className="text-muted-foreground">
                    View all shop units registered in the system.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Units</CardTitle>
                    <CardDescription>
                        List of units (e.g., kg, pcs) used by shops.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Shop</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {units.map((unit) => (
                                <TableRow key={unit.name}>
                                    <TableCell className="font-medium">{unit.name}</TableCell>
                                    <TableCell>{unit.shop}</TableCell>
                                    <TableCell>
                                        <Badge variant={unit.active ? "default" : "secondary"}>
                                            {unit.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {units.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        No shop units found.
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
