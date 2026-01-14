"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import { getLeaveTypes, createLeaveApplication } from "@/app/actions/handson/all/hrms/leave";
import { getCompanies } from "@/app/actions/handson/all/hrms/companies";

export default function ApplyLeavePage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<any[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [halfDay, setHalfDay] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const [empData, typeData, companyData] = await Promise.all([
            getEmployees(),
            getLeaveTypes(),
            getCompanies()
        ]);
        setEmployees(empData || []);
        setLeaveTypes(typeData || []);
        setCompanies(companyData || []);
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        // Find company for the selected employee
        const employeeObj = employees.find(emp => emp.name === selectedEmployee);
        const company = employeeObj?.company || companies[0]?.name;

        const data = {
            employee: selectedEmployee,
            leave_type: selectedType,
            from_date: fromDate,
            to_date: toDate,
            half_day: halfDay,
            reason: formData.get("reason"),
            company: company
        };

        const result = await createLeaveApplication(data);

        if (result.success) {
            toast.success("Leave application submitted successfully");
            router.push("/handson/all/hr/leave");
        } else {
            toast.error(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Apply for Leave</h1>
                <p className="text-muted-foreground">Submit a new leave request for approval.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Leave Details</CardTitle>
                    <CardDescription>Fill in the dates and type of leave required.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Employee</Label>
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.name} value={emp.name}>
                                            {emp.employee_name} ({emp.name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Leave Type</Label>
                            <Select value={selectedType} onValueChange={setSelectedType} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Leave Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveTypes.map(type => (
                                        <SelectItem key={type.name} value={type.name}>
                                            {type.leave_type_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>From Date</Label>
                                <Input
                                    type="date"
                                    required
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>To Date</Label>
                                <Input
                                    type="date"
                                    required
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="half_day"
                                checked={halfDay}
                                onCheckedChange={(checked) => setHalfDay(checked as boolean)}
                            />
                            <Label htmlFor="half_day">Half Day</Label>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Textarea name="reason" placeholder="e.g. Sick leave, Personal commitments..." required />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Submitting..." : "Submit Application"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
