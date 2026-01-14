"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Ticket, CheckCircle2, XCircle, Calendar, Users, Percent, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { getVouchers, createVoucher, updateVoucher, deleteVoucher } from "@/app/actions/handson/control/vouchers";

const voucherSchema = z.object({
    voucher_code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
    voucher_type: z.enum(["Trial Extension", "Discount"]),
    trial_days: z.coerce.number().min(0).optional(),
    discount_scope: z.enum(["First Payment", "Recurring"]).optional(),
    discount_type: z.enum(["Percentage", "Fixed Amount"]).optional(),
    discount_percentage: z.coerce.number().min(0).max(100).optional(),
    discount_amount: z.coerce.number().min(0).optional(),
    discount_duration_months: z.coerce.number().min(0).optional(),
    is_active: z.boolean().default(true),
    expiry_date: z.string().optional(),
    max_uses: z.coerce.number().min(0).optional(),
});

export default function VouchersPage() {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<any | null>(null);

    const form = useForm<z.infer<typeof voucherSchema>>({
        resolver: zodResolver(voucherSchema),
        defaultValues: {
            voucher_code: "",
            voucher_type: "Trial Extension",
            is_active: true,
            trial_days: 30,
            discount_scope: "First Payment",
            discount_type: "Percentage",
            discount_percentage: 0,
            discount_amount: 0,
            discount_duration_months: 0,
            max_uses: 0
        }
    });

    const voucherType = form.watch("voucher_type");
    const discountScope = form.watch("discount_scope");
    const discountType = form.watch("discount_type");

    async function fetchData() {
        setLoading(true);
        const res = await getVouchers();
        if (res.status === "success") {
            setVouchers(res.data);
        } else {
            toast.error("Failed to load vouchers: " + res.error);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const openDialog = (voucher?: any) => {
        if (voucher) {
            setEditingVoucher(voucher);
            form.reset({
                voucher_code: voucher.voucher_code,
                voucher_type: voucher.voucher_type,
                trial_days: voucher.trial_days,
                discount_scope: voucher.discount_scope,
                discount_type: voucher.discount_type,
                discount_percentage: voucher.discount_percentage,
                discount_amount: voucher.discount_amount,
                discount_duration_months: voucher.discount_duration_months,
                is_active: !!voucher.is_active,
                expiry_date: voucher.expiry_date,
                max_uses: voucher.max_uses,
            });
        } else {
            setEditingVoucher(null);
            form.reset({
                voucher_code: "",
                voucher_type: "Trial Extension",
                is_active: true,
                trial_days: 30,
                discount_scope: "First Payment",
                discount_type: "Percentage",
                discount_percentage: 0,
                discount_amount: 0,
                discount_duration_months: 0,
                max_uses: 0
            });
        }
        setIsDialogOpen(true);
    };

    const onSubmit = async (values: z.infer<typeof voucherSchema>) => {
        try {
            if (editingVoucher) {
                const res = await updateVoucher(editingVoucher.name, values);
                if (res.status === "success") {
                    toast.success("Voucher updated");
                } else {
                    throw new Error(res.error);
                }
            } else {
                const res = await createVoucher(values);
                if (res.status === "success") {
                    toast.success("Voucher created");
                } else {
                    throw new Error(res.error);
                }
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to save voucher");
        }
    };

    const onDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this voucher?")) return;
        const res = await deleteVoucher(name);
        if (res.status === "success") {
            toast.success("Voucher deleted");
            fetchData();
        } else {
            toast.error("Failed to delete: " + res.error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Voucher Management</h1>
                    <p className="text-muted-foreground">Create and manage subscription vouchers for trials and discounts.</p>
                </div>
                <Button onClick={() => openDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> New Voucher
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Vouchers</CardTitle>
                    <CardDescription>A list of all vouchers currently configured in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Benefit</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vouchers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No vouchers found. Click 'New Voucher' to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                vouchers.map((v) => (
                                    <TableRow key={v.name}>
                                        <TableCell className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            {v.voucher_code}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{v.voucher_type}</span>
                                                {v.voucher_type === "Discount" && (
                                                    <span className="text-[10px] uppercase text-muted-foreground tracking-wider">
                                                        {v.discount_scope}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {v.voucher_type === "Trial Extension" ? (
                                                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{v.trial_days} Day Trial</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                                    {v.discount_type === "Percentage" ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                                                    <span>
                                                        {v.discount_type === "Percentage" ? `${v.discount_percentage}%` : v.discount_amount} off
                                                        {v.discount_duration_months > 0 && ` for ${v.discount_duration_months} cycles`}
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Users className="w-4 h-4" />
                                                <span>{v.used_count || 0}{v.max_uses ? ` / ${v.max_uses}` : ""}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {v.is_active ? (
                                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 border-none flex items-center gap-1 w-fit">
                                                    <CheckCircle2 className="w-3 h-3" /> Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground flex items-center gap-1 w-fit">
                                                    <XCircle className="w-3 h-3" /> Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openDialog(v)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDelete(v.name)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingVoucher ? "Edit Voucher" : "Create New Voucher"}</DialogTitle>
                        <DialogDescription>
                            Configure the behavior and limits of this voucher code.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="voucher_code" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Voucher Code</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Ticket className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input className="pl-9 font-mono font-bold uppercase tracking-widest" placeholder="WELCOME60" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="voucher_type" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Voucher Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Trial Extension">Trial Extension</SelectItem>
                                                <SelectItem value="Discount">Discount</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="is_active" render={({ field }) => (
                                    <FormItem className="flex flex-col justify-end space-y-2">
                                        <FormLabel>Active Status</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2 h-10">
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                <span className="text-sm text-muted-foreground">{field.value ? "Enabled" : "Disabled"}</span>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>

                            {voucherType === "Trial Extension" ? (
                                <FormField control={form.control} name="trial_days" render={({ field }) => (
                                    <FormItem className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                        <FormLabel className="text-blue-700 dark:text-blue-300">Trial Period (Days)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-blue-500" />
                                                <Input type="number" className="pl-9 bg-white dark:bg-zinc-950" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormDescription>The total number of trial days granted when using this code.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            ) : (
                                <div className="space-y-4 bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-900/30">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="discount_scope" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-green-700 dark:text-green-300">Discount Scope</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white dark:bg-zinc-950">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="First Payment">First Payment</SelectItem>
                                                        <SelectItem value="Recurring">Recurring</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="discount_type" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-green-700 dark:text-green-300">Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white dark:bg-zinc-950">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Percentage">Percentage</SelectItem>
                                                        <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {discountType === "Percentage" ? (
                                            <FormField control={form.control} name="discount_percentage" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-green-700 dark:text-green-300">Percent Off (%)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Percent className="absolute left-3 top-3 w-4 h-4 text-green-500" />
                                                            <Input type="number" className="pl-9 bg-white dark:bg-zinc-950" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        ) : (
                                            <FormField control={form.control} name="discount_amount" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-green-700 dark:text-green-300">Fixed Off</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-green-500" />
                                                            <Input type="number" className="pl-9 bg-white dark:bg-zinc-950" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        )}

                                        {discountScope === "Recurring" && (
                                            <FormField control={form.control} name="discount_duration_months" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-green-700 dark:text-green-300">Cycles</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Clock className="absolute left-3 top-3 w-4 h-4 text-green-500" />
                                                            <Input type="number" className="pl-9 bg-white dark:bg-zinc-950" placeholder="Forever" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-green-600/70 dark:text-green-400/50 mt-1">
                                        {discountScope === "Recurring" && !form.getValues("discount_duration_months") ?
                                            "* Recurring discount will apply indefinitely unless the plan changes." :
                                            discountScope === "Recurring" ? `* Discount will apply for the next ${form.getValues("discount_duration_months")} billing cycles.` :
                                                "* Discount will apply to the very first charge after the trial ends."
                                        }
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="max_uses" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Uses</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                <Input type="number" className="pl-9" placeholder="Unlimited" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="expiry_date" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                                    {editingVoucher ? "Save Changes" : "Create Voucher"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
