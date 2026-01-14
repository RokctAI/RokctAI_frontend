"use client";

import { format, subDays } from "date-fns";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { getSalesReport } from "@/app/actions/paas/admin/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminSalesReportPage() {
    const [report, setReport] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [company, setCompany] = useState("");

    useEffect(() => {
        handleSearch();
    }, []);

    async function handleSearch() {
        setLoading(true);
        try {
            const data = await getSalesReport(fromDate, toDate, company || undefined);
            setReport(data);
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    }

    const totalSales = report.reduce((sum, item) => sum + item.grand_total, 0);
    const totalCommission = report.reduce((sum, item) => sum + (item.commission || 0), 0);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Sales Report</h1>

            <Card>
                <CardContent className="p-4 flex flex-wrap gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">From Date</label>
                        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">To Date</label>
                        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Shop (Optional)</label>
                        <Input placeholder="Shop Name" value={company} onChange={(e) => setCompany(e.target.value)} />
                    </div>
                    <Button onClick={handleSearch} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}
                        Generate Report
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${totalCommission.toFixed(2)}</div>
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
                            <TableHead>Total</TableHead>
                            <TableHead>Commission</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {report.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No data found for selected period.
                                </TableCell>
                            </TableRow>
                        ) : (
                            report.map((item) => (
                                <TableRow key={item.name}>
                                    <TableCell>{format(new Date(item.creation), "PPP")}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.shop}</TableCell>
                                    <TableCell>${item.grand_total.toFixed(2)}</TableCell>
                                    <TableCell>${(item.commission || 0).toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
