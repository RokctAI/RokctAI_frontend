"use client";

import { useEffect, useState } from "react";
import { Plus, User, Mail, Shield } from "lucide-react";
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

import { getUsers, createUser, UserRole } from "@/app/actions/handson/tenant/settings/users";

const userSchema = z.object({
    email: z.string().email("Invalid email"),
    first_name: z.string().min(1, "First Name is required"),
    last_name: z.string().optional(),
    role: z.enum(["Employee", "Client", "Accountant", "Viewer"] as const)
});

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            email: "",
            first_name: "",
            last_name: "",
            role: "Employee"
        }
    });

    async function fetchUsers() {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const openDialog = () => {
        form.reset({
            email: "",
            first_name: "",
            last_name: "",
            role: "Employee"
        });
        setIsDialogOpen(true);
    };

    const onSubmit = async (values: z.infer<typeof userSchema>) => {
        try {
            const res = await createUser(values);
            if (res.success) {
                toast.success("User created successfully");
                fetchUsers();
                setIsDialogOpen(false);
            } else {
                toast.error("Failed to create user: " + res.error);
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">Manage login access and roles for your team & clients.</p>
                </div>
                <Button onClick={openDialog}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Accounts with access to the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.name}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-primary" />
                                                </div>
                                                {user.first_name} {user.last_name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.enabled ? "default" : "secondary"}>
                                                {user.enabled ? "Active" : "Disabled"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>New User Account</DialogTitle>
                        <DialogDescription>
                            Create a login for a new team member or client. They will receive an email to set their password.
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

                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl><Input {...field} type="email" placeholder="colleague@company.com" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Profile</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Employee">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Employee</span>
                                                    <span className="text-xs text-muted-foreground">Standard access to modules</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Accountant">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Accountant</span>
                                                    <span className="text-xs text-muted-foreground">Finance & Billing access</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Client">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Client</span>
                                                    <span className="text-xs text-muted-foreground">Restricted Portal access</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Viewer">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Viewer</span>
                                                    <span className="text-xs text-muted-foreground">Read-only (Demo/Audit)</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <DialogFooter>
                                <Button type="submit">Create User</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
