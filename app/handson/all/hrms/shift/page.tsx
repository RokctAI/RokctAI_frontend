"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Plus, Shield } from "lucide-react";
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
import { getShiftAssignments } from "@/app/actions/handson/all/hrms/shifts";

export default function ShiftPage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getShiftAssignments();
        setAssignments(data || []);
        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center">
                        <CalendarRange className="mr-3 h-8 w-8" />
                        Shift Management
                    </h1>
                    <p className="text-muted-foreground">Manage employee rosters and shift schedules.</p>
                </div>
                <Link href="/handson/all/hr/shift/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Assign Shift
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Roster Overview</CardTitle>
                    <CardDescription>Upcoming shift assignments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Shift Type</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
                                </TableRow>
                            ) : assignments.length > 0 ? (
                                assignments.map((assign) => (
                                    <TableRow key={assign.name}>
                                        <TableCell className="font-medium">
                                            {assign.employee_name}
                                            <div className="text-xs text-muted-foreground">{assign.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">
                                                {assign.shift_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(assign.start_date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            {assign.end_date ? format(new Date(assign.end_date), "MMM d, yyyy") : <span className="text-muted-foreground italic">Ongoing</span>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={assign.status === 'Active' ? 'default' : 'secondary'}>
                                                {assign.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No active shift assignments.
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
