"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { getMyProfile, updateMyProfile } from "@/app/actions/handson/all/hrms/me/employees";
import { getDepartments } from "@/app/actions/handson/all/hrms/departments";
import { getDesignations } from "@/app/actions/handson/all/hrms/designations";
import { getCompanies } from "@/app/actions/handson/all/hrms/companies";

const employeeSchema = z.object({
    first_name: z.string().min(1, "First Name is required"),
    last_name: z.string().optional(),
    company: z.string().min(1, "Company is required"),
    department: z.string().optional(),
    designation: z.string().optional(),
    status: z.enum(["Active", "Left", "Suspended"]).optional(),
    contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
    date_of_joining: z.string().optional()
});

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

    const form = useForm<z.infer<typeof employeeSchema>>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            company: "",
            department: "",
            designation: "",
            status: "Active",
            contact_email: "",
            date_of_joining: format(new Date(), "yyyy-MM-dd")
        }
    });

    async function fetchData() {
        setLoading(true);
        try {
            const [profile, depts, desigs] = await Promise.all([
                getMyProfile(),
                getDepartments(),
                getDesignations()
            ]);
            // If profile exists, set as 'selectedEmployee' to view detials, or handle as single view
            // For now, let's assume this page shows a list, but for "Me" it should show just one card?
            // Actually, "Me" employees page usually IS the profile.
            // Let's adapt the state.
            if (profile) {
                setEmployees([profile]); // Hack to keep existing map logic working if it expects a list
                setSelectedEmployee(profile);
                setIsEditing(false); // Default to view mode
            } else {
                setEmployees([]);
            }

            setDepartments(depts || []);
            setDesignations(desigs || []);
        } catch (error) {
            console.error("Error fetching HR data:", error);
            toast.error("Failed to fetch HR data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const openDialog = (employee?: any) => {
        if (employee) {
            setEditingEmployee(employee);
            form.reset({
                first_name: employee.first_name || employee.employee_name.split(" ")[0],
                last_name: employee.last_name || "",
                company: employee.company,
                department: employee.department,
                designation: employee.designation,
                status: employee.status,
                contact_email: employee.contact_email || "",
                date_of_joining: employee.date_of_joining
            });
            setIsDialogOpen(true);
        }
    };

    const onSubmit = async (values: z.infer<typeof employeeSchema>) => {
        try {
            if (editingEmployee) {
                // Prepare specific fields to update (avoid sending everything if API is strict, but set_value handles dict)
                const res = await updateMyProfile(values);
                if (res.success) {
                    toast.success("Profile updated successfully");
                    fetchData();
                    setIsDialogOpen(false);
                } else {
                    toast.error("Failed to update profile: " + res.error);
                }
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">My Professional Profile</h1>
                    <p className="text-muted-foreground">Manage your credentials and bank-level verification status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="glass py-1 px-3 border-emerald-200 text-emerald-700 bg-emerald-50/50">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                        System Active
                    </Badge>
                </div>
            </div>

            <Card className="glass-card shadow-2xl border-none overflow-hidden">
                <CardHeader className="border-b bg-white/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">Employee Record</CardTitle>
                            <CardDescription>Official employment and verification data.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="font-bold">Identity & Name</TableHead>
                                    <TableHead className="font-bold">Role & Dept</TableHead>
                                    <TableHead className="font-bold">Financial Trust</TableHead>
                                    <TableHead className="font-bold">Employment</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-48 text-muted-foreground italic">
                                            No profile data available.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    employees.map((emp) => (
                                        <TableRow key={emp.name} className="hover:bg-slate-50/80 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900">{emp.employee_name}</span>
                                                        {emp.id_verified && (
                                                            <div title="Identity Verified (South Africa)" className="bg-emerald-100 p-0.5 rounded-full">
                                                                <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-mono text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded self-start">
                                                        {emp.id_number || "No ID Recorded"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{emp.designation || "Staff"}</span>
                                                    <span className="text-xs text-muted-foreground">{emp.department || "General"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={`text-[10px] py-0 h-4 border-none ${emp.bank_account_verified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                                            {emp.bank_account_verified ? "Bank Verified" : "Pending Bank"}
                                                        </Badge>
                                                        {emp.tax_id && (
                                                            <Badge variant="outline" className="text-[10px] py-0 h-4 bg-slate-50 border-none">Tax Recorded</Badge>
                                                        )}
                                                    </div>
                                                    {emp.bank_name && <span className="text-[10px] font-medium text-slate-500">{emp.bank_name} • ***{emp.bank_account_no?.slice(-4)}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <Badge className="w-fit text-[10px] py-0 px-1.5 mb-1" variant={emp.status === "Active" ? "default" : "secondary"}>
                                                        {emp.status}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground">{emp.date_of_joining ? `Joined: ${format(new Date(emp.date_of_joining), "MMM yyyy")}` : ""}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="hover:bg-slate-200" onClick={() => openDialog(emp)}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Edit Profile
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                            Enter the details of the employee.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="first_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="last_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="contact_email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input {...field} type="email" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="company" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Company" />
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
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Left">Left</SelectItem>
                                                <SelectItem value="Suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="department" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departments.map(d => (
                                                    <SelectItem key={d.name} value={d.name}>{d.department_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="designation" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Designation</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {designations.map(d => (
                                                    <SelectItem key={d.name} value={d.name}>{d.designation_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="date_of_joining" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date of Joining</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <DialogFooter>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
