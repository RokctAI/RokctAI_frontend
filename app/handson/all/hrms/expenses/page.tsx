"use client";

import { useEffect, useState } from "react";
import { Receipt, Plus } from "lucide-react";
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
import { getExpenseClaims } from "@/app/actions/handson/all/hrms/expenses";

export default function ExpensesPage() {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getExpenseClaims();
        setClaims(data || []);
        setLoading(false);
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Paid": return "default";
            case "Approved": return "default"; // or green
            case "Submitted": return "secondary"; // Blueish
            case "Draft": return "outline";
            case "Rejected": return "destructive";
            case "Cancelled": return "destructive";
            default: return "outline";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center">
                        <Receipt className="mr-3 h-8 w-8" />
                        Expense Claims
                    </h1>
                    <p className="text-muted-foreground">Manage employee expense reimbursements.</p>
                </div>
                <Link href="/handson/all/hr/expenses/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Claim
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Claims History</CardTitle>
                    <CardDescription>Recent expense claims submitted.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4">Loading...</TableCell>
                                </TableRow>
                            ) : claims.length > 0 ? (
                                claims.map((claim) => (
                                    <TableRow key={claim.name}>
                                        <TableCell className="font-medium">
                                            {claim.employee_name}
                                            <div className="text-xs text-muted-foreground">{claim.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(claim.posting_date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {claim.grand_total?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || "$0.00"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(claim.status || claim.approval_status) as any}>
                                                {claim.status || claim.approval_status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No expense claims found.
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
