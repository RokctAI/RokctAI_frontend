"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
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

import { getMyExpenseClaims, createMyExpenseClaim } from "@/app/actions/handson/all/hrms/me/expenses";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import { getCompanies } from "@/app/actions/handson/all/hrms/companies";

const expenseItemSchema = z.object({
    expense_type: z.string().min(1, "Type is required"),
    amount: z.coerce.number().min(0.01, "Amount must be positive"),
    description: z.string().optional()
});

const expenseSchema = z.object({
    employee: z.string().min(1, "Employee is required"),
    company: z.string().min(1, "Company is required"),
    posting_date: z.string(),
    expenses: z.array(expenseItemSchema).min(1, "At least one expense item is required")
});

export default function ExpensesPage() {
    const [claims, setClaims] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof expenseSchema>>({
        resolver: zodResolver(expenseSchema) as any,
        defaultValues: {
            posting_date: format(new Date(), "yyyy-MM-dd"),
            expenses: [{ expense_type: "", amount: 0, description: "" }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "expenses"
    });

    async function fetchData() {
        setLoading(true);
        try {
            const [claimData, empData, compData] = await Promise.all([
                getMyExpenseClaims(),
                getEmployees(),
                getCompanies()
            ]);
            setClaims(claimData || []);
            setEmployees(empData || []);
            setCompanies(compData || []);
            if (compData.length > 0) form.setValue("company", compData[0].name);
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (values: z.infer<typeof expenseSchema>) => {
        const payload = {
            ...values,
            expenses: values.expenses.map(e => ({
                ...e,
                expense_date: values.posting_date
            }))
        };
        const res = await createMyExpenseClaim(payload);
        if (res.success) {
            toast.success("Expense Claim Submitted");
            fetchData();
            setIsDialogOpen(false);
            form.reset({
                posting_date: format(new Date(), "yyyy-MM-dd"),
                company: values.company,
                expenses: [{ expense_type: "", amount: 0, description: "" }]
            });
        } else {
            toast.error("Failed: " + res.error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Expense Claims</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> New Claim</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>New Expense Claim</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="employee" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Employee</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
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
                                    <FormField control={form.control} name="company" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {companies.map(c => (
                                                        <SelectItem key={c.name} value={c.name}>{c.company_name || c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <FormField control={form.control} name="posting_date" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Expenses</FormLabel>
                                        <Button type="button" variant="outline" size="sm" onClick={() => append({ expense_type: "", amount: 0, description: "" })}>
                                            Add Item
                                        </Button>
                                    </div>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-12 gap-2 items-end border p-2 rounded">
                                            <div className="col-span-4">
                                                <FormField control={form.control} name={`expenses.${index}.expense_type`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Type</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Travel">Travel</SelectItem>
                                                                <SelectItem value="Meals">Meals</SelectItem>
                                                                <SelectItem value="Accommodation">Accommodation</SelectItem>
                                                                <SelectItem value="Supplies">Supplies</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <div className="col-span-3">
                                                <FormField control={form.control} name={`expenses.${index}.amount`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Amount</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <div className="col-span-4">
                                                <FormField control={form.control} name={`expenses.${index}.description`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Description</FormLabel>
                                                        <FormControl><Input {...field} placeholder="Details..." /></FormControl>
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <div className="col-span-1">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                    <span className="sr-only">Delete</span>
                                                    <span aria-hidden>×</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <DialogFooter>
                                    <Button type="submit">Submit Claim</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Claims History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {claims.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No claims found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                claims.map((claim) => (
                                    <TableRow key={claim.name}>
                                        <TableCell>{format(new Date(claim.posting_date), "MMM d, yyyy")}</TableCell>
                                        <TableCell className="font-medium">{claim.employee_name}</TableCell>
                                        <TableCell>
                                            <Badge variant={claim.approval_status === "Approved" ? "default" : "secondary"}>
                                                {claim.approval_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{claim.total_claimed_amount?.toFixed(2)}</TableCell>
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
