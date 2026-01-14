"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getPayouts } from "@/app/actions/paas/admin/finance";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPayouts() {
            try {
                const data = await getPayouts();
                setPayouts(data);
            } catch (error) {
                console.error("Error fetching payouts:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPayouts();
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
            <h1 className="text-3xl font-bold">Seller Payouts</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Shop</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payouts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No payouts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            payouts.map((payout) => (
                                <TableRow key={payout.name}>
                                    <TableCell>{format(new Date(payout.payout_date), "PPP")}</TableCell>
                                    <TableCell>{payout.shop}</TableCell>
                                    <TableCell className="font-medium">${payout.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={payout.status === "Paid" ? "default" : "secondary"}>
                                            {payout.status}
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
