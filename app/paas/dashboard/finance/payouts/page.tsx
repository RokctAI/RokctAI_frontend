"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getPayouts } from "@/app/actions/paas/finance";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";


export default function PayoutsPage() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const data = await getPayouts();
            setPayouts(data);
        } catch (error) {
            console.error("Error fetching payouts:", error);
            toast.error("Failed to load payouts");
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
                <h1 className="text-3xl font-bold">Payouts</h1>
                <p className="text-muted-foreground">View your payout history from the platform.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>List of all payouts processed to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Payout ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payouts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No payouts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payouts.map((p) => (
                                    <TableRow key={p.name}>
                                        <TableCell>{format(new Date(p.payout_date), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>{p.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={p.status === 'Paid' ? 'default' : 'secondary'}>
                                                {p.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-green-600">
                                            {formatCurrency(p.amount)}
                                        </TableCell>
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
