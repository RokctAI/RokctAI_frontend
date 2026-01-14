"use client";

import { useEffect, useState } from "react";
import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { getEmployeeAdvances } from "@/app/actions/handson/all/hrms/advances";

export default function AdvancesPage() {
    const [advances, setAdvances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getEmployeeAdvances();
        setAdvances(data || []);
        setLoading(false);
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Paid": return "default";
            case "Draft": return "secondary";
            case "Claimed": return "default"; // Greenish
            case "Returned": return "outline";
            case "Unpaid": return "destructive"; // Red/Orange
            case "Cancelled": return "destructive";
            default: return "outline";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center">
                        <Wallet className="mr-3 h-8 w-8" />
                        Employee Advances
                    </h1>
                    <p className="text-muted-foreground">Manage cash advances and repayments.</p>
                </div>
                <Link href="/handson/all/hr/advances/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Advance
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Advances History</CardTitle>
                    <CardDescription>Recent advance requests and their status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Purpose</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">Loading...</TableCell>
                                </TableRow>
                            ) : advances.length > 0 ? (
                                advances.map((adv) => (
                                    <TableRow key={adv.name}>
                                        <TableCell className="font-medium">
                                            {adv.employee_name}
                                            <div className="text-xs text-muted-foreground">{adv.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(adv.posting_date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>{adv.purpose}</TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {adv.advance_amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || "$0.00"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {adv.paid_amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || "$0.00"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(adv.status) as any}>
                                                {adv.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No employee advances found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
