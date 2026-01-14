"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getAllProductExtraGroups } from "@/app/actions/paas/admin/products";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProductExtrasPage() {
    const [extras, setExtras] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchExtras() {
            try {
                const data = await getAllProductExtraGroups();
                setExtras(data);
            } catch (error) {
                console.error("Error fetching extras:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchExtras();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Product Extras & Addons</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Active</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : extras.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No extras found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            extras.map((extra) => (
                                <TableRow key={extra.name}>
                                    <TableCell className="font-medium">{extra.name}</TableCell>
                                    <TableCell>{extra.type}</TableCell>
                                    <TableCell>
                                        <Badge variant={extra.active ? "default" : "secondary"}>
                                            {extra.active ? "Active" : "Inactive"}
                                        </Badge>
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
