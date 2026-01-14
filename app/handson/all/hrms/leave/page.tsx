"use client";

import { useEffect, useState } from "react";
import { Plus, Calendar, FileText } from "lucide-react";
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
import { getLeaveApplications, getLeaveAllocations } from "@/app/actions/handson/all/hrms/leave";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import { verifyHrRole } from "@/app/lib/roles";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeaveDashboard() {
    const [applications, setApplications] = useState<any[]>([]);
    const [allocations, setAllocations] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [canApply, setCanApply] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            loadAllocations(selectedEmployee);
        }
    }, [selectedEmployee]);

    async function loadInitialData() {
        setLoading(true);
        const [appData, empData] = await Promise.all([
            getLeaveApplications(),
            getEmployees()
        ]);
        setApplications(appData || []);
        setEmployees(empData || []);
        setCanApply(empData && empData.length > 0); // Implicitly if we can fetch employees, we are HR. Or reuse explicit check.
        // Better to be explicit:
        const role = await verifyHrRole();
        setCanApply(role);

        // Default to first employee if available for allocation view
        if (empData && empData.length > 0) {
            setSelectedEmployee(empData[0].name);
        }
        setLoading(false);
    }

    async function loadAllocations(empId: string) {
        const allocData = await getLeaveAllocations(empId);
        setAllocations(allocData || []);
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved": return "default";
            case "Rejected": return "destructive";
            case "Open": return "secondary";
            default: return "outline";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Leave Management</h1>
                    <p className="text-muted-foreground">Track balances, requests, and holidays.</p>
                </div>
                <div className="flex space-x-2">
                    <Link href="/handson/all/hr/leave/holidays">
                        <Button variant="outline"><Calendar className="mr-2 h-4 w-4" /> Holidays</Button>
                    </Link>
                    <Link href="/handson/all/hr/leave/holidays">
                        <Button variant="outline"><Calendar className="mr-2 h-4 w-4" /> Holidays</Button>
                    </Link>
                    {canApply && (
                        <Link href="/handson/all/hr/leave/new">
                            <Button><Plus className="mr-2 h-4 w-4" /> Apply Leave</Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Balances Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Leave Balances</h2>
                    <div className="w-[300px]">
                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Employee to view balances" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map(e => (
                                    <SelectItem key={e.name} value={e.name}>{e.employee_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
                    ) : allocations.length > 0 ? (
                        allocations.map((alloc) => (
                            <Card key={alloc.name}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {alloc.leave_type}
                                    </CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{alloc.unused_leaves}</div>
                                    <p className="text-xs text-muted-foreground">
                                        of {alloc.total_leaves_allocated} allocated
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Valid till {alloc.to_date}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-4 text-center py-8 text-muted-foreground bg-muted/50 rounded-lg">
                            No allocations found for this employee.
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Applications Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>History of leave requests across the organization.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
                                </TableRow>
                            ) : applications.length > 0 ? (
                                applications.map((app) => (
                                    <TableRow key={app.name}>
                                        <TableCell className="font-medium">
                                            {app.employee_name}
                                            <div className="text-xs text-muted-foreground">{app.name}</div>
                                        </TableCell>
                                        <TableCell>{app.leave_type}</TableCell>
                                        <TableCell>
                                            {format(new Date(app.from_date), "MMM d")} - {format(new Date(app.to_date), "MMM d, yyyy")}
                                            {app.half_day === 1 && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Half Day</span>}
                                        </TableCell>
                                        <TableCell>{app.total_leave_days}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(app.status) as any}>
                                                {app.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No leave applications found.
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
