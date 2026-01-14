"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getReportData } from "@/app/actions/paas/admin/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface GenericReportProps {
    title: string;
    reportType: string;
    columns: { key: string; label: string; format?: (val: any) => string }[];
}

export default function GenericReport({ title, reportType, columns }: GenericReportProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const reportData = await getReportData(reportType);
                setData(reportData);
            } catch (error) {
                console.error(`Error fetching ${title}:`, error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [reportType, title]);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">{title}</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map(col => (
                                <TableHead key={col.key}>{col.label}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <Loader2 className="size-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    No data available.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, i) => (
                                <TableRow key={i}>
                                    {columns.map(col => (
                                        <TableCell key={col.key}>
                                            {col.format ? col.format(row[col.key]) : row[col.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
