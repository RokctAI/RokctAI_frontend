"use client";

import { useEffect, useState } from "react";
import { Clock, LogIn, LogOut, History, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import { getAttendanceList, getTodayAttendance, checkIn, checkOut } from "@/app/actions/handson/all/hrms/attendance";

export default function AttendancePage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [todayRecord, setTodayRecord] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            refreshStatus(selectedEmployee);
        } else {
            setTodayRecord(null);
        }
    }, [selectedEmployee]);

    async function loadInitialData() {
        setLoading(true);
        const [empData, histData] = await Promise.all([
            getEmployees(),
            getAttendanceList()
        ]);
        setEmployees(empData || []);
        setHistory(histData || []);

        if (empData && empData.length > 0) {
            setSelectedEmployee(empData[0].name);
        }
        setLoading(false);
    }

    async function refreshStatus(empId: string) {
        const today = await getTodayAttendance(empId);
        setTodayRecord(today);
        // Also refresh history to show latest
        const hist = await getAttendanceList();
        setHistory(hist || []);
    }

    async function handleCheckIn() {
        if (!selectedEmployee) return;
        setActionLoading(true);

        const emp = employees.find(e => e.name === selectedEmployee);
        const company = emp?.company || "";

        const result = await checkIn({
            employee: selectedEmployee,
            company: company,
            timestamp: new Date().toISOString() // Local time handling might be needed depending on requirements
        });

        if (result.success) {
            toast.success("Checked In successfully");
            refreshStatus(selectedEmployee);
        } else {
            toast.error(result.error);
        }
        setActionLoading(false);
    }

    async function handleCheckOut() {
        if (!selectedEmployee) return;
        setActionLoading(true);

        const result = await checkOut({
            employee: selectedEmployee,
            timestamp: new Date().toISOString()
        });

        if (result.success) {
            toast.success("Checked Out successfully");
            refreshStatus(selectedEmployee);
        } else {
            toast.error(result.error);
        }
        setActionLoading(false);
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Present": return "default";
            case "Absent": return "destructive";
            case "Half Day": return "secondary";
            default: return "outline";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center">
                        <Clock className="mr-3 h-8 w-8" />
                        Attendance
                    </h1>
                    <p className="text-muted-foreground">Manage daily check-ins and view history.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Employee Selector & Action Card */}
                <Card className="md:col-span-1 border-primary/20 shadow-md">
                    <CardHeader>
                        <CardTitle>Daily Action</CardTitle>
                        <CardDescription>Select employee to mark attendance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Employee</label>
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(e => (
                                        <SelectItem key={e.name} value={e.name}>
                                            <div className="flex items-center">
                                                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {e.employee_name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 flex flex-col items-center space-y-4">
                            <div className="text-6xl font-mono tracking-tighter text-slate-700">
                                {format(new Date(), "HH:mm")}
                            </div>
                            <div className="text-muted-foreground">
                                {format(new Date(), "EEEE, MMMM do, yyyy")}
                            </div>

                            <div className="flex items-center space-x-4 w-full justify-center pt-2">
                                {todayRecord?.in_time ? (
                                    todayRecord.out_time ? (
                                        <Button variant="outline" className="w-full max-w-xs cursor-default hover:bg-background" size="lg">
                                            Completed for Today
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleCheckOut}
                                            disabled={actionLoading}
                                            variant="secondary"
                                            size="lg"
                                            className="w-full max-w-xs bg-orange-100 text-orange-700 hover:bg-orange-200"
                                        >
                                            <LogOut className="mr-2 h-5 w-5" />
                                            Check Out
                                        </Button>
                                    )
                                ) : (
                                    <Button
                                        onClick={handleCheckIn}
                                        disabled={actionLoading || !selectedEmployee}
                                        size="lg"
                                        className="w-full max-w-xs bg-green-600 hover:bg-green-700"
                                    >
                                        <LogIn className="mr-2 h-5 w-5" />
                                        Check In
                                    </Button>
                                )}
                            </div>

                            {todayRecord && (
                                <div className="text-xs text-muted-foreground pt-2">
                                    Last Check-in: {format(new Date(todayRecord.in_time), "h:mm a")}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Summary / Stats (Placeholder for now) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>Attendance statistics.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                                <span className="text-sm">Days Present (This Month)</span>
                                <span className="font-bold">--</span>
                            </div>
                            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                                <span className="text-sm">Late Entries</span>
                                <span className="font-bold">--</span>
                            </div>
                            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                                <span className="text-sm">Average Hours</span>
                                <span className="font-bold">--</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* History Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <History className="mr-2 h-5 w-5" />
                        Attendance Log
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>In Type</TableHead>
                                <TableHead>Out Time</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">Loading...</TableCell>
                                </TableRow>
                            ) : history.length > 0 ? (
                                history.map((rec) => (
                                    <TableRow key={rec.name}>
                                        <TableCell className="font-medium">{rec.employee_name}</TableCell>
                                        <TableCell>{rec.attendance_date}</TableCell>
                                        <TableCell>
                                            {rec.in_time ? format(new Date(rec.in_time), "h:mm a") : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {rec.out_time ? format(new Date(rec.out_time), "h:mm a") : "-"}
                                        </TableCell>
                                        <TableCell>{rec.working_hours ? rec.working_hours.toFixed(1) : "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadge(rec.status) as any}>
                                                {rec.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No attendance records found.
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
