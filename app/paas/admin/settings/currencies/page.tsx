"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getCurrencies } from "@/app/actions/paas/admin/settings";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CurrenciesPage() {
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCurrencies() {
            try {
                const data = await getCurrencies();
                setCurrencies(data);
            } catch (error) {
                console.error("Error fetching currencies:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCurrencies();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Currencies</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Exchange Rate</TableHead>
                            <TableHead>Active</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : currencies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No currencies found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currencies.map((curr) => (
                                <TableRow key={curr.name}>
                                    <TableCell className="font-medium">{curr.currency_name}</TableCell>
                                    <TableCell>{curr.symbol}</TableCell>
                                    <TableCell>{curr.code}</TableCell>
                                    <TableCell>{curr.exchange_rate}</TableCell>
                                    <TableCell>
                                        <Badge variant={curr.active ? "default" : "secondary"}>
                                            {curr.active ? "Active" : "Inactive"}
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
