"use client";

import { format } from "date-fns";
import { Loader2, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getBonuses } from "@/app/actions/paas/marketing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";


export default function BonusesPage() {
    const [bonuses, setBonuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const data = await getBonuses();
            setBonuses(data);
        } catch (error) {
            console.error("Error fetching bonuses:", error);
            toast.error("Failed to load bonuses");
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
                <h1 className="text-3xl font-bold">Bonuses</h1>
                <p className="text-muted-foreground">View bonuses awarded to your shop.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Bonus History</CardTitle>
                    <CardDescription>List of all bonuses received.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bonuses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        No bonuses found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bonuses.map((bonus) => (
                                    <TableRow key={bonus.name}>
                                        <TableCell>{format(new Date(bonus.bonus_date), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Gift className="mr-2 size-4 text-purple-500" />
                                                {bonus.reason}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-green-600">
                                            {formatCurrency(bonus.amount)}
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
