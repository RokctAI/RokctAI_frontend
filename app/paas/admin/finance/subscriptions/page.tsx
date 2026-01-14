"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getShopSubscriptions } from "@/app/actions/paas/admin/transactions";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ShopSubscriptionsPage() {
    const [subs, setSubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSubs() {
            try {
                const data = await getShopSubscriptions();
                setSubs(data);
            } catch (error) {
                console.error("Error fetching subscriptions:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSubs();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Shop Subscriptions</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Shop</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : subs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No subscriptions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            subs.map((sub) => (
                                <TableRow key={sub.name}>
                                    <TableCell className="font-medium">{sub.shop}</TableCell>
                                    <TableCell>{sub.plan}</TableCell>
                                    <TableCell>{format(new Date(sub.start_date), "PPP")}</TableCell>
                                    <TableCell>{format(new Date(sub.end_date), "PPP")}</TableCell>
                                    <TableCell>
                                        <Badge variant={sub.active ? "default" : "secondary"}>
                                            {sub.active ? "Active" : "Expired"}
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
