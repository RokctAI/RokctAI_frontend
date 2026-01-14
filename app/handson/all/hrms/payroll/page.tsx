"use client";

import { useEffect, useState } from "react";
import { Banknote, FileText } from "lucide-react";
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
import { getSalarySlips } from "@/app/actions/handson/all/hrms/payroll";
import { verifyHrRole } from "@/app/lib/roles";

export default function PayrollPage() {
    const [slips, setSlips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const [canProcess, setCanProcess] = useState(false);

    async function loadData() {
        const data = await getSalarySlips();
        const role = await verifyHrRole();
        setSlips(data || []);
        setCanProcess(role);
        setLoading(false);
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Submitted": return "default"; // Paid/Finalized usually
            case "Draft": return "secondary"; // Draft
            case "Cancelled": return "destructive";
            default: return "outline";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center">
                        <Banknote className="mr-3 h-8 w-8" />
                        Payroll
                    </h1>
                    <p className="text-muted-foreground">Manage salary slips and view payroll history.</p>
                </div>
                {canProcess && (
                    <Button>
                        <Banknote className="mr-2 h-4 w-4" /> Process Payroll
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Salary Slips</CardTitle>
                    <CardDescription>Recent salary slips generated for employees.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead className="text-right">Gross Pay</TableHead>
                                <TableHead className="text-right">Deductions</TableHead>
                                <TableHead className="text-right">Net Pay</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">Loading...</TableCell>
                                </TableRow>
                            ) : slips.length > 0 ? (
                                slips.map((slip) => (
                                    <TableRow key={slip.name}>
                                        <TableCell className="font-medium">
                                            {slip.employee_name}
                                            <div className="text-xs text-muted-foreground">{slip.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(slip.start_date), "MMM d")} - {format(new Date(slip.end_date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {slip.gross_pay?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || "$0.00"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm text-red-600">
                                            {slip.total_deduction?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || "$0.00"}
                                        </TableCell>
                                        <TableCell className="text-right font-bold font-mono text-sm text-green-600">
                                            {slip.net_pay?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || "$0.00"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(slip.status) as any}>
                                                {slip.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/handson/all/hr/payroll/${slip.name}`}>
                                                <Button variant="ghost" size="sm">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No salary slips found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div >
    );
}
