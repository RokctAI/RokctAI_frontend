"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
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
import { getWarnings, createWarning } from "@/app/actions/handson/all/crm/lifecycle";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";

export default function WarningPage() {
    const [warnings, setWarnings] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const [wData, eData] = await Promise.all([getWarnings(), getEmployees()]);
        setWarnings(wData || []);
        setEmployees(eData || []);
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            employee: formData.get("employee"),
            warning_date: formData.get("warning_date"),
            warning_type: formData.get("warning_type"),
            subject: formData.get("subject"),
            description: formData.get("description"),
        };

        try {
            await createWarning(data);
            toast.success("Warning issued");
            setIsOpen(false);
            loadData();
        } catch (error) {
            toast.error("Failed to issue warning");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Disciplinary Actions</h1>
                    <p className="text-muted-foreground">Manage employee warnings and disciplinary records.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive"><Plus className="mr-2 h-4 w-4" /> Issue Warning</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Issue Warning</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Employee</Label>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Level</Label>
                                    <Select name="warning_type" defaultValue="Verbal">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Verbal">Verbal</SelectItem>
                                            <SelectItem value="Written">Written</SelectItem>
                                            <SelectItem value="Final Warning">Final Warning</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input name="warning_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input name="subject" required placeholder="e.g. Late Arrival" />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea name="description" placeholder="Details of the incident..." />
                            </div>
                            <Button type="submit" variant="destructive" className="w-full">Issue Warning</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {warnings.map((w) => (
                                <TableRow key={w.name}>
                                    <TableCell className="font-medium">{w.employee}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${w.warning_type === 'Final Warning' ? 'bg-red-100 text-red-800' :
                                            w.warning_type === 'Written' ? 'bg-orange-100 text-orange-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {w.warning_type}
                                        </span>
                                    </TableCell>
                                    <TableCell>{w.subject}</TableCell>
                                    <TableCell>{format(new Date(w.warning_date || new Date()), "MMM d, yyyy")}</TableCell>
                                </TableRow>
                            ))}
                            {warnings.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                        No disciplinary records.
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
