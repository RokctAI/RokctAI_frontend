"use client";

import { Loader2, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getReceipts } from "@/app/actions/paas/receipts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ReceiptsPage() {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReceipts();
    }, []);

    async function fetchReceipts() {
        try {
            const data = await getReceipts();
            setReceipts(data);
        } catch (error) {
            console.error("Error fetching receipts:", error);
            toast.error("Failed to load receipts");
        } finally {
            setLoading(false);
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
            <div>
                <h1 className="text-3xl font-bold">Recipes & Receipts</h1>
                <p className="text-muted-foreground">Manage product recipes and receipts.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Receipt List</CardTitle>
                    <CardDescription>All recipes/receipts available.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receipts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        No receipts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                receipts.map((receipt) => (
                                    <TableRow key={receipt.name}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="size-4 text-muted-foreground" />
                                                {receipt.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{receipt.status || "Active"}</TableCell>
                                        <TableCell>{new Date(receipt.creation).toLocaleDateString()}</TableCell>
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
