"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getCashbackRules } from "@/app/actions/paas/admin/marketing";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CashbackRulesPage() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRules() {
            try {
                const data = await getCashbackRules();
                setRules(data);
            } catch (error) {
                console.error("Error fetching cashback rules:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRules();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Cashback Rules</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Min Order</TableHead>
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
                        ) : rules.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No cashback rules found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rules.map((rule) => (
                                <TableRow key={rule.name}>
                                    <TableCell className="font-medium">{rule.rule_name}</TableCell>
                                    <TableCell>{rule.type}</TableCell>
                                    <TableCell>{rule.type === "Percentage" ? `${rule.amount}%` : `$${rule.amount}`}</TableCell>
                                    <TableCell>${rule.min_order_amount}</TableCell>
                                    <TableCell>
                                        <Badge variant={rule.active ? "default" : "secondary"}>
                                            {rule.active ? "Active" : "Inactive"}
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
