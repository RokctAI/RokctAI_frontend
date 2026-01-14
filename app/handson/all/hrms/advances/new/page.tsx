"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import { createEmployeeAdvance } from "@/app/actions/handson/all/hrms/advances";

const formSchema = z.object({
    employee: z.string().min(1, "Employee is required"),
    posting_date: z.date({ required_error: "Date is required" }),
    purpose: z.string().min(1, "Purpose is required"),
    advance_amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    repay_from_salary: z.boolean().default(false),
});

export default function NewAdvancePage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            repay_from_salary: false,
        },
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const emps = await getEmployees();
        setEmployees(emps || []);
        setLoading(false);
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const emp = employees.find(e => e.name === values.employee);

        const payload = {
            employee: values.employee,
            company: emp?.company || "",
            posting_date: format(values.posting_date, "yyyy-MM-dd"),
            purpose: values.purpose,
            advance_amount: values.advance_amount,
            repay_from_salary: values.repay_from_salary
        };

        const result = await createEmployeeAdvance(payload);

        if (result.success) {
            toast.success("Employee Advance created successfully");
            router.push("/handson/all/hr/advances");
        } else {
            toast.error(result.error);
        }
    }

    if (loading) return <div className="p-8">Loading form data...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 mb-10">
            <div>
                <h1 className="text-3xl font-bold">New Advance Request</h1>
                <p className="text-muted-foreground">Request a cash advance.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="posting_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date</FormLabel>
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

                                <FormField
                                    control={form.control}
                                    name="advance_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="100" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="purpose"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purpose</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Reason for advance..." className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="repay_from_salary"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Repay from Salary
                                            </FormLabel>
                                            <FormDescription>
                                                Unclaimed amounts will be deducted from future salary slips.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Submitting..." : "Submit Request"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
