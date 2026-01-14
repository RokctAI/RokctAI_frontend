"use client";

import { useEffect, useState } from "react";
import { Plus, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { getPolicies, createPolicy } from "@/app/actions/handson/all/crm/lifecycle";

export default function PolicyPage() {
    const [policies, setPolicies] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getPolicies();
        setPolicies(data || []);
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get("title"),
            policy_type: formData.get("policy_type"),
            date: formData.get("date"),
            details: formData.get("details"),
        };

        try {
            await createPolicy(data);
            toast.success("Policy created");
            setIsOpen(false);
            loadData();
        } catch (error) {
            toast.error("Failed to create policy");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Company Policies</h1>
                    <p className="text-muted-foreground">Manage internal HR and security policies.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> New Policy</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Policy</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input name="title" required placeholder="e.g. Remote Work Policy" />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select name="policy_type" defaultValue="General">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HR">HR</SelectItem>
                                        <SelectItem value="Security">Security</SelectItem>
                                        <SelectItem value="Leave">Leave</SelectItem>
                                        <SelectItem value="Expense">Expense</SelectItem>
                                        <SelectItem value="General">General</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Effective Date</Label>
                                <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="space-y-2">
                                <Label>Details</Label>
                                <Textarea name="details" placeholder="Policy content..." />
                            </div>
                            <Button type="submit" className="w-full">Create Policy</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Policies</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {policies.map((policy) => (
                                <TableRow key={policy.name}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {policy.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>{policy.policy_type}</TableCell>
                                    <TableCell>{format(new Date(policy.date || new Date()), "MMM d, yyyy")}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {policies.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                        No policies found.
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
