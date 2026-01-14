"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    getCustomerWallets,
    getWalletLedgers,
    getTenantPayoutRequests,
    deleteCustomerWallet,
    deleteWalletLedger,
    deleteTenantPayoutRequest
} from "@/app/actions/handson/control/finance/finance";

export default function FinancePage() {
    const [wallets, setWallets] = useState<any[]>([]);
    const [ledgers, setLedgers] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        setLoading(true);
        try {
            const [walletsData, ledgersData, payoutsData] = await Promise.all([
                getCustomerWallets(),
                getWalletLedgers(),
                getTenantPayoutRequests()
            ]);
            setWallets(walletsData || []);
            setLedgers(ledgersData || []);
            setPayouts(payoutsData || []);
        } catch (error) {
            console.error("Error fetching finance data:", error);
            toast.error("Failed to fetch finance data");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteWallet(name: string) {
        if (!confirm("Are you sure you want to delete this wallet?")) return;
        try {
            await deleteCustomerWallet(name);
            toast.success("Wallet deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete wallet");
        }
    }

    async function handleDeleteLedger(name: string) {
        if (!confirm("Are you sure you want to delete this ledger entry?")) return;
        try {
            await deleteWalletLedger(name);
            toast.success("Ledger entry deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete ledger entry");
        }
    }

    async function handleDeletePayout(name: string) {
        if (!confirm("Are you sure you want to delete this payout request?")) return;
        try {
            await deleteTenantPayoutRequest(name);
            toast.success("Payout request deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete payout request");
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Finance Management</h1>
                    <p className="text-muted-foreground">Manage wallets, ledgers, and payouts.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchData} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="wallets">
                <TabsList>
                    <TabsTrigger value="wallets">Customer Wallets</TabsTrigger>
                    <TabsTrigger value="ledger">Wallet Ledger</TabsTrigger>
                    <TabsTrigger value="payouts">Payout Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="wallets" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Wallets</CardTitle>
                            <CardDescription>Wallets associated with customers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Balance</TableHead>
                                        <TableHead>Currency</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {wallets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No wallets found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        wallets.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.customer}</TableCell>
                                                <TableCell>{item.balance}</TableCell>
                                                <TableCell>{item.currency}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteWallet(item.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ledger" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Wallet Ledger</CardTitle>
                            <CardDescription>Transaction history for wallets.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Wallet</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ledgers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No ledger entries found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        ledgers.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.wallet}</TableCell>
                                                <TableCell>{item.amount}</TableCell>
                                                <TableCell>{item.transaction_type}</TableCell>
                                                <TableCell>{item.date ? format(new Date(item.date), "MMM d, yyyy") : "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteLedger(item.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payouts" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tenant Payout Requests</CardTitle>
                            <CardDescription>Requests for payouts from tenants.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Tenant</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payouts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No payout requests found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        payouts.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.tenant}</TableCell>
                                                <TableCell>{item.amount}</TableCell>
                                                <TableCell>{item.status}</TableCell>
                                                <TableCell>{item.requested_date ? format(new Date(item.requested_date), "MMM d, yyyy") : "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeletePayout(item.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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
