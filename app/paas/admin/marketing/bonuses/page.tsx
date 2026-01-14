"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getShopBonuses } from "@/app/actions/paas/admin/marketing";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminBonusesPage() {
    const [bonuses, setBonuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBonuses() {
            try {
                const data = await getShopBonuses();
                setBonuses(data);
            } catch (error) {
                console.error("Error fetching bonuses:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBonuses();
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
            <h1 className="text-3xl font-bold">Shop Bonuses</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Shop</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Reason</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bonuses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No bonuses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            bonuses.map((bonus) => (
                                <TableRow key={bonus.name}>
                                    <TableCell>{format(new Date(bonus.bonus_date), "PPP")}</TableCell>
                                    <TableCell>{bonus.shop}</TableCell>
                                    <TableCell className="font-medium text-green-600">
                                        +${bonus.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>{bonus.reason}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
