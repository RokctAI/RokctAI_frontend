"use client";

import { format } from "date-fns";
import { Loader2, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

import { getPayouts, getDeliveryStatistics } from "@/app/actions/paas/delivery";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DeliveryFinancePage() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [payoutsData, statsData] = await Promise.all([
                    getPayouts(),
                    getDeliveryStatistics()
                ]);
                setPayouts(payoutsData);
                setStats(statsData);
            } catch (error) {
                console.error("Error fetching finance data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
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
            <h1 className="text-3xl font-bold">Earnings & Payouts</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.total_earnings?.toFixed(2) || "0.00"}</div>
                        <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Reference</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payouts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No payout history found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            payouts.map((payout) => (
                                <TableRow key={payout.name}>
                                    <TableCell>
                                        {format(new Date(payout.payment_date), "PPP")}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        ${payout.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={payout.status === "Paid" ? "default" : "secondary"}>
                                            {payout.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {payout.name}
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
