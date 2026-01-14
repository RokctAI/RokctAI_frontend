"use client";

import { addDays, format } from "date-fns";
import { Loader2, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { getRevenueReport } from "@/app/actions/paas/admin/reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RevenueReportPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });

    useEffect(() => {
        if (date?.from && date?.to) {
            fetchReport();
        }
    }, [date]);

    async function fetchReport() {
        setLoading(true);
        try {
            const reportData = await getRevenueReport({
                from: format(date!.from!, "yyyy-MM-dd"),
                to: format(date!.to!, "yyyy-MM-dd")
            });
            setData(reportData);
        } catch (error) {
            console.error("Error fetching revenue report:", error);
        } finally {
            setLoading(false);
        }
    }

    const totalRevenue = data.reduce((sum, item) => sum + (item.grand_total || 0), 0);
    const totalCommission = data.reduce((sum, item) => sum + (item.commission || 0), 0);

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Revenue Report</h1>
                <div className="flex gap-4">
                    <DatePickerWithRange date={date} setDate={setDate} />
                    <Button variant="outline">
                        <Download className="mr-2 size-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Commission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">${totalCommission.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Shop</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Commission</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No data for selected period.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow key={row.name}>
                                    <TableCell>{format(new Date(row.creation), "PPP")}</TableCell>
                                    <TableCell className="font-medium">{row.name}</TableCell>
                                    <TableCell>{row.shop}</TableCell>
                                    <TableCell>{row.status}</TableCell>
                                    <TableCell className="text-right">${row.grand_total.toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-green-600">
                                        +${row.commission.toFixed(2)}
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
