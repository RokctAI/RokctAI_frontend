"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getAllReceipts } from "@/app/actions/paas/admin/products";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProductReceiptsPage() {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReceipts() {
            try {
                const data = await getAllReceipts();
                setReceipts(data);
            } catch (error) {
                console.error("Error fetching receipts:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchReceipts();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Product Recipes</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : receipts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No recipes found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            receipts.map((receipt) => (
                                <TableRow key={receipt.name}>
                                    <TableCell className="font-medium">{receipt.name}</TableCell>
                                    <TableCell>{receipt.product}</TableCell>
                                    <TableCell>{format(new Date(receipt.creation), "PPP")}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
