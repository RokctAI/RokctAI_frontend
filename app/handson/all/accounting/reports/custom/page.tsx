"use client";

import { useEffect, useState } from "react";
import { getSessionCurrency } from "@/app/actions/currency";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { runFinancialReport } from "@/app/actions/handson/all/reports/financial";
import { Loader2, TrendingUp, TrendingDown, DollarSign, PieChart, ShoppingCart, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function FinancialDashboard() {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("Yearly");
    const [pnlData, setPnlData] = useState<any>(null);
    const [bsData, setBsData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [period]); // Reload when period changes

    async function loadData() {
        setLoading(true);
        // Fetch P&L and Balance Sheet
        // Note: Filters might need to be adjusted based on fiscal year. Default often works for 'current'.
        const pnl = await runFinancialReport("Profit and Loss", { period: period });
        const bs = await runFinancialReport("Balance Sheet", { period: period });

        setPnlData(processReportData(pnl));
        setBsData(processReportData(bs));
        setLoading(false);
    }

    // Helper to extract key numbers from the complex Frappe report result
    function processReportData(reportResult: any) {
        if (!reportResult || !reportResult.result || !reportResult.result.length) return null;

        // Detailed parsing would go here. For now, we look for root rows.
        // Frappe Query Reports return a flat list with indentation levels.
        const rows = reportResult.result;

        // Simple extraction for demo:
        const income = rows.find((r: any) => r.account_name === "Income" || r.root_type === "Income")?.balance || 0;
        const expense = rows.find((r: any) => r.account_name === "Expenses" || r.root_type === "Expense")?.balance || 0;
        const profit = rows.find((r: any) => r.account_name === "Profit for the year" || r.account_name === "Net Profit")?.balance || (income - expense);

        const assets = rows.find((r: any) => r.account_name === "Assets" || r.root_type === "Asset")?.balance || 0;
        const liabilities = rows.find((r: any) => r.account_name === "Liabilities" || r.root_type === "Liability")?.balance || 0;

        return { income, expense, profit, assets, liabilities };
    }

    if (loading) {
        return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    // Data for the Income vs Expense chart
    const chartData = [
        {
            name: "Financials",
            Income: pnlData?.income || 0,
            Expense: pnlData?.expense || 0,
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
                <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="This Month">This Month</SelectItem>
                            <SelectItem value="Last Month">Last Month</SelectItem>
                            <SelectItem value="This Quarter">This Quarter</SelectItem>
                            <SelectItem value="This Year">This Year</SelectItem>
                            <SelectItem value="Last Year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                </div>
            </div>

            <Tabs defaultValue="pnl" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
                    <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
                    {/* <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger> */}
                </TabsList>

                <TabsContent value="pnl" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(pnlData?.income || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">Year to Date</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(pnlData?.expense || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">Year to Date</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={cn(
                                    "text-2xl font-bold",
                                    (pnlData?.profit || 0) >= 0 ? "text-blue-600" : "text-red-600"
                                )}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(pnlData?.profit || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">Net Income</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Income vs Expense</CardTitle>
                            <CardDescription>Profitability Analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2 h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value as number)} />
                                    <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value as number)} />
                                    <Legend />
                                    <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="balance-sheet" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(bsData?.assets || 0)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Liabilities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(bsData?.liabilities || 0)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader><CardTitle>Equity</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Equity: {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format((bsData?.assets || 0) - (bsData?.liabilities || 0))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Utility to conditionally join class names
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}
