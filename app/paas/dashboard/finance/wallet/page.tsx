"use client";

import { format } from "date-fns";
import { Loader2, Wallet as WalletIcon, ArrowUpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getWallet, getWalletHistory, topUpWallet } from "@/app/actions/paas/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";


export default function WalletPage() {
    const [wallet, setWallet] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [topUpAmount, setTopUpAmount] = useState("");
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [w, h] = await Promise.all([
                getWallet(),
                getWalletHistory()
            ]);
            setWallet(w);
            setHistory(h);
        } catch (error) {
            console.error("Error fetching wallet data:", error);
            toast.error("Failed to load wallet data");
        } finally {
            setLoading(false);
        }
    }

    const handleTopUp = async () => {
        const amount = parseFloat(topUpAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setProcessing(true);
        try {
            await topUpWallet(amount);
            toast.success("Wallet topped up successfully!");
            setIsTopUpOpen(false);
            setTopUpAmount("");
            fetchData();
        } catch (error) {
            console.error("Error topping up wallet:", error);
            toast.error("Failed to top up wallet");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">My Wallet</h1>
                    <p className="text-muted-foreground">Manage your wallet balance and view transaction history.</p>
                </div>
                <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <ArrowUpCircle className="mr-2 size-4" />
                            Top Up Wallet
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Top Up Wallet</DialogTitle>
                            <DialogDescription>
                                Enter the amount you want to add to your wallet.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                    Amount
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    className="col-span-3"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleTopUp} disabled={processing}>
                                {processing ? <Loader2 className="size-4 animate-spin" /> : "Confirm Top Up"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Current Balance
                        </CardTitle>
                        <WalletIcon className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(wallet?.wallet_balance || 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Wallet History</CardTitle>
                    <CardDescription>Recent transactions affecting your wallet balance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No history found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((item) => (
                                    <TableRow key={item.name}>
                                        <TableCell>{format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
                                        <TableCell>{item.type}</TableCell>
                                        <TableCell>{item.status}</TableCell>
                                        <TableCell className={`text-right font-medium ${item.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.type === 'Credit' ? '+' : '-'}{formatCurrency(item.price)}
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
