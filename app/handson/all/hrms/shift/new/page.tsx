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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import { getShiftTypes, createShiftAssignment } from "@/app/actions/handson/all/hrms/shifts";

const formSchema = z.object({
    employee: z.string().min(1, "Employee is required"),
    shift_type: z.string().min(1, "Shift Type is required"),
    start_date: z.date({ required_error: "Start Date is required" }),
    end_date: z.date().optional(),
});

export default function NewShiftPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<any[]>([]);
    const [shiftTypes, setShiftTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const [emps, types] = await Promise.all([
            getEmployees(),
            getShiftTypes()
        ]);
        setEmployees(emps || []);
        setShiftTypes(types || []);
        setLoading(false);
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const emp = employees.find(e => e.name === values.employee);

        const payload = {
            employee: values.employee,
            company: emp?.company || "",
            shift_type: values.shift_type,
            start_date: format(values.start_date, "yyyy-MM-dd"),
            end_date: values.end_date ? format(values.end_date, "yyyy-MM-dd") : undefined
        };

        const result = await createShiftAssignment(payload);

        if (result.success) {
            toast.success("Shift Assigned successfully");
            router.push("/handson/all/hr/shift");
        } else {
            toast.error(result.error);
        }
    }

    if (loading) return <div className="p-8">Loading form data...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 mb-10">
            <div>
                <h1 className="text-3xl font-bold">Assign Shift</h1>
                <p className="text-muted-foreground">Allocate shift schedules to employees.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Assignment Details</CardTitle>
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

                            <FormField
                                control={form.control}
                                name="shift_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shift Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Shift" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {shiftTypes.map((s) => (
                                                    <SelectItem key={s.name} value={s.name}>
                                                        {s.name} ({s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)})
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
                                    name="start_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
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
                                                            date < new Date("1900-01-01")
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
                                    name="end_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date (Optional)</FormLabel>
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
                                                            date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription className="text-xs">
                                                Leave empty for ongoing shift.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Assigning..." : "Confirm Assignment"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
