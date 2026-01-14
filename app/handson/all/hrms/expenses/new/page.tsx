"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import { getExpenseClaimTypes, createExpenseClaim } from "@/app/actions/handson/all/hrms/expenses";

const formSchema = z.object({
    employee: z.string().min(1, "Employee is required"),
    posting_date: z.date({ required_error: "Posting Date is required" }),
    expenses: z.array(z.object({
        expense_type: z.string().min(1, "Type is required"),
        expense_date: z.date({ required_error: "Date is required" }),
        amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
        description: z.string().optional()
    })).min(1, "At least one expense must be added"),
});

export default function NewExpensePage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<any[]>([]);
    const [expenseTypes, setExpenseTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            expenses: [{ amount: 0, description: "" }]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "expenses",
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const [emps, types] = await Promise.all([
            getEmployees(),
            getExpenseClaimTypes()
        ]);
        setEmployees(emps || []);
        setExpenseTypes(types || []);
        setLoading(false);
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const emp = employees.find(e => e.name === values.employee);

        const payload = {
            employee: values.employee,
            company: emp?.company || "",
            posting_date: format(values.posting_date, "yyyy-MM-dd"),
            expenses: values.expenses.map(exp => ({
                expense_type: exp.expense_type,
                amount: exp.amount,
                description: exp.description,
                expense_date: format(exp.expense_date, "yyyy-MM-dd")
            }))
        };

        const result = await createExpenseClaim(payload);

        if (result.success) {
            toast.success("Expense Claim created successfully");
            router.push("/handson/all/hr/expenses");
        } else {
            toast.error(result.error);
        }
    }

    if (loading) return <div className="p-8">Loading form data...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 mb-10">
            <div>
                <h1 className="text-3xl font-bold">New Expense Claim</h1>
                <p className="text-muted-foreground">Submit a claim for reimbursement.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Claim Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="employee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employee</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Employee" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {employees.map((e) => (
                                                    <SelectItem key={e.name} value={e.name}>
                                                        {e.employee_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="posting_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Claim Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Expenses</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ amount: 0, description: "" } as any)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid gap-4 md:grid-cols-12 items-end border p-4 rounded-md bg-muted/20">
                                    <div className="md:col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`expenses.${index}.expense_type`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-9">
                                                                <SelectValue placeholder="Select Type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {expenseTypes.map((t) => (
                                                                <SelectItem key={t.name} value={t.name}>
                                                                    {t.expense_type}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`expenses.${index}.expense_date`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-xs">Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal h-9",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "MM/dd/yy")
                                                                    ) : (
                                                                        <span>Pick date</span>
                                                                    )}
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) =>
                                                                    date > new Date() || date < new Date("1900-01-01")
                                                                }
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`expenses.${index}.amount`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Amount</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" className="h-9" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`expenses.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Description</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-9" placeholder="Notes..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {fields.length === 0 && <div className="text-sm text-center text-muted-foreground py-4">No items added.</div>}
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Submitting..." : "Submit Claim"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
