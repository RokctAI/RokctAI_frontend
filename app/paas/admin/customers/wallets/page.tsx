"use client";

import { Loader2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { getWallets } from "@/app/actions/paas/admin/customers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function WalletsPage() {
    const [wallets, setWallets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWallets() {
            try {
                const data = await getWallets();
                setWallets(data);
            } catch (error) {
                console.error("Error fetching wallets:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchWallets();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Wallets</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : wallets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No wallets found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            wallets.map((wallet) => (
                                <TableRow key={wallet.name}>
                                    <TableCell className="font-medium">{wallet.user}</TableCell>
                                    <TableCell>{wallet.type}</TableCell>
                                    <TableCell className="text-right font-bold flex items-center justify-end gap-2">
                                        <Wallet className="size-4 text-muted-foreground" />
                                        ${wallet.balance.toFixed(2)}
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
