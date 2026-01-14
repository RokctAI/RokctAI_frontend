"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getMyLeaveApplications, createMyLeaveApplication } from "@/app/actions/handson/all/hrms/me/leave";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";

const leaveSchema = z.object({
    employee: z.string().min(1, "Employee is required"),
    leave_type: z.string().min(1, "Leave Type is required"),
    from_date: z.string().min(1, "Start Date is required"),
    to_date: z.string().min(1, "End Date is required"),
    reason: z.string().optional()
});

export default function LeavePage() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof leaveSchema>>({
        resolver: zodResolver(leaveSchema),
        defaultValues: {
            from_date: format(new Date(), "yyyy-MM-dd"),
            to_date: format(new Date(), "yyyy-MM-dd"),
            leave_type: "Casual Leave"
        }
    });

    async function fetchData() {
        setLoading(true);
        try {
            const [leaveData, empData] = await Promise.all([
                getMyLeaveApplications(),
                getEmployees()
            ]);
            setLeaves(leaveData || []);
            setEmployees(empData || []);
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (values: z.infer<typeof leaveSchema>) => {
        const res = await createMyLeaveApplication(values);
        if (res.success) {
            toast.success("Leave Application Submitted");
            fetchData();
            setIsDialogOpen(false);
            form.reset();
        } else {
            toast.error("Failed: " + res.error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Leave Applications</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> New Request</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Apply for Leave</DialogTitle>
                            <DialogDescription>Submit a new leave request.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="employee" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employee</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Employee" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {employees.map(emp => (
                                                    <SelectItem key={emp.name} value={emp.name}>{emp.employee_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="leave_type" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Leave Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                                                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                                <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                                                <SelectItem value="Leave Without Pay">Leave Without Pay</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="from_date" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>From</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="to_date" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>To</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <FormField control={form.control} name="reason" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason</FormLabel>
                                        <FormControl><Input {...field} placeholder="Optional" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <DialogFooter>
                                    <Button type="submit">Submit</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Total Days</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaves.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No applications found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leaves.map((leave) => (
                                    <TableRow key={leave.name}>
                                        <TableCell className="font-medium">{leave.employee_name}</TableCell>
                                        <TableCell>{leave.leave_type}</TableCell>
                                        <TableCell>
                                            {format(new Date(leave.from_date), "MMM d")} - {format(new Date(leave.to_date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>{leave.total_leave_days}</TableCell>
                                        <TableCell>
                                            <Badge variant={leave.status === "Approved" ? "default" : (leave.status === "Rejected" ? "destructive" : "secondary")}>
                                                {leave.status}
                                            </Badge>
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
