"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getGrievances, createGrievance, getGrievanceTypes } from "@/app/actions/handson/all/crm/lifecycle";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import { Badge } from "@/components/ui/badge";

export default function GrievancePage() {
    const [grievances, setGrievances] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const [gData, eData, tData] = await Promise.all([getGrievances(), getEmployees(), getGrievanceTypes()]);
        setGrievances(gData || []);
        setEmployees(eData || []);
        setTypes(tData || []);
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            employee: formData.get("employee"),
            grievance_date: formData.get("grievance_date"),
            subject: formData.get("subject"),
            description: formData.get("description"),
            grievance_type: formData.get("grievance_type"),
            grievance_against: formData.get("grievance_against"),
            status: "Open"
        };

        try {
            await createGrievance(data);
            toast.success("Grievance submitted");
            setIsOpen(false);
            loadData();
        } catch (error) {
            toast.error("Failed to submit grievance");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Employee Grievances</h1>
                    <p className="text-muted-foreground">Internal complaints and resolution tracking.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> New Complaint</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Submit Grievance</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Complainant (Employee)</Label>
                                <Select name="employee" required>
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
                                <Label>Date</Label>
                                <Input name="grievance_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="space-y-2">
                                <Label>Grievance Type</Label>
                                <Select name="grievance_type" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map(t => (
                                            <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Grievance Against (Employee)</Label>
                                <Select name="grievance_against" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Accused Employee" />
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
                                <Label>Subject</Label>
                                <Input name="subject" required placeholder="e.g. Workplace Safety Concern" />
                            </div>
                            <div className="space-y-2">
                                <Label>Details</Label>
                                <Textarea name="description" placeholder="Describe the issue..." />
                            </div>
                            <Button type="submit" className="w-full">Submit</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Case History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grievances.map((g) => (
                                <TableRow key={g.name}>
                                    <TableCell className="font-medium">{g.employee_name || g.raised_by}</TableCell>
                                    <TableCell>
                                        <div>{g.subject}</div>
                                        <div className="text-xs text-muted-foreground">{g.grievance_type}</div>
                                    </TableCell>
                                    <TableCell>{format(new Date(g.date || new Date()), "MMM d, yyyy")}</TableCell>
                                    <TableCell>
                                        <Badge variant={g.status === 'Resolved' ? 'default' : 'secondary'}>
                                            {g.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {grievances.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                        No grievances found.
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
