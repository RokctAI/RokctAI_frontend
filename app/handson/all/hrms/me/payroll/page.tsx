"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getSalarySlips } from "@/app/actions/handson/all/hrms/payroll";

export default function PayrollPage() {
    const [payslips, setPayslips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        setLoading(true);
        try {
            const data = await getSalarySlips();
            setPayslips(data || []);
        } catch (error) {
            toast.error("Failed to fetch payslips");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Payroll</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payslips</CardTitle>
                    <CardDescription>View recent salary slips.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Net Pay</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payslips.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No payslips found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payslips.map((slip) => (
                                    <TableRow key={slip.name}>
                                        <TableCell className="font-medium">{slip.employee_name}</TableCell>
                                        <TableCell>
                                            {format(new Date(slip.start_date), "MMM d")} - {format(new Date(slip.end_date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={slip.status === "Submitted" ? "default" : "secondary"}>
                                                {slip.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{slip.net_pay?.toLocaleString()}</TableCell>
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
