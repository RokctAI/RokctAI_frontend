"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getTransactions, getShopPayments, getPartnerPayments } from "@/app/actions/paas/finance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";


export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [shopPayments, setShopPayments] = useState<any[]>([]);
    const [partnerPayments, setPartnerPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [trx, shop, partner] = await Promise.all([
                getTransactions(),
                getShopPayments(),
                getPartnerPayments()
            ]);
            setTransactions(trx);
            setShopPayments(shop);
            setPartnerPayments(partner);
        } catch (error) {
            console.error("Error fetching transactions data:", error);
            toast.error("Failed to load transactions data");
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
                <h1 className="text-3xl font-bold">Transactions</h1>
                <p className="text-muted-foreground">View your transaction history and payments.</p>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All Transactions</TabsTrigger>
                    <TabsTrigger value="shop">Shop Payments</TabsTrigger>
                    <TabsTrigger value="partner">Partner Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Transactions</CardTitle>
                            <CardDescription>A comprehensive list of all transactions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No transactions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.map((t) => (
                                            <TableRow key={t.name}>
                                                <TableCell>{format(new Date(t.transaction_date), 'MMM d, yyyy')}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{t.reference_name}</div>
                                                    <div className="text-xs text-muted-foreground">{t.reference_doctype}</div>
                                                </TableCell>
                                                <TableCell>{t.debit > 0 ? "Debit" : "Credit"}</TableCell>
                                                <TableCell className="text-right text-red-600">
                                                    {t.debit > 0 ? formatCurrency(t.debit) : "-"}
                                                </TableCell>
                                                <TableCell className="text-right text-green-600">
                                                    {t.credit > 0 ? formatCurrency(t.credit) : "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="shop">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shop Payments</CardTitle>
                            <CardDescription>Payments received for your shop orders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shopPayments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No shop payments found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        shopPayments.map((p) => (
                                            <TableRow key={p.name}>
                                                <TableCell>{format(new Date(p.transaction_date), 'MMM d, yyyy')}</TableCell>
                                                <TableCell>{p.reference_name}</TableCell>
                                                <TableCell className="text-right font-medium text-green-600">
                                                    {formatCurrency(p.credit)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="partner">
                    <Card>
                        <CardHeader>
                            <CardTitle>Partner Payments</CardTitle>
                            <CardDescription>Payments made to delivery partners.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Delivery Man</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {partnerPayments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No partner payments found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        partnerPayments.map((p) => (
                                            <TableRow key={p.name}>
                                                <TableCell>{format(new Date(p.payment_date), 'MMM d, yyyy')}</TableCell>
                                                <TableCell>{p.deliveryman}</TableCell>
                                                <TableCell>{p.status}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(p.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
