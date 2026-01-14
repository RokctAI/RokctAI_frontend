
"use client";

import { useEffect, useState, Suspense } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPurchaseInvoice } from "@/app/actions/handson/all/accounting/purchases/createPurchaseInvoice";
import { getSuppliers } from "@/app/actions/handson/all/accounting/buying/supplier";
import { getItems } from "@/app/actions/handson/all/accounting/inventory/item";
import { getPurchaseOrder } from "@/app/actions/handson/all/accounting/buying/order";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const purchaseInvoiceSchema = z.object({
    supplier: z.string().min(1, "Supplier is required"),
    posting_date: z.string().min(1, "Date is required"),
    items: z.array(z.object({
        item_code: z.string().min(1, "Item is required"),
        qty: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().min(1)),
        rate: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().min(0)),
    })).min(1, "At least one item is required"),
});

function NewPurchaseInvoiceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromPO = searchParams.get('from_po');

    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);

    const form = useForm<z.infer<typeof purchaseInvoiceSchema>>({
        resolver: zodResolver(purchaseInvoiceSchema),
        defaultValues: {
            supplier: "",
            posting_date: new Date().toISOString().split('T')[0],
            items: [{ item_code: "", qty: 1, rate: 0 }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useEffect(() => {
        getSuppliers().then(setSuppliers);
        getItems().then(setItems);

        if (fromPO) {
            getPurchaseOrder(fromPO).then(po => {
                if (po) {
                    form.setValue("supplier", po.supplier);
                    // Map PO items to Invoice items
                    // Note: PO items might have different field names if not careful, but usually item_code, qty, rate match
                    const invoiceItems = po.items.map((item: any) => ({
                        item_code: item.item_code,
                        qty: item.qty,
                        rate: item.rate
                    }));
                    replace(invoiceItems); // Replace default empty item with PO items
                    toast.success(`Loaded details from ${fromPO}`);
                }
            });
        }
    }, [fromPO, form, replace]);

    const onSubmit = async (values: z.infer<typeof purchaseInvoiceSchema>) => {
        setLoading(true);
        try {
            const res = await createPurchaseInvoice({ ...values });
            if (res.success) {
                toast.success("Purchase Invoice created");
                router.push("/handson/all/financials/accounts");
            } else {
                toast.error("Error: " + res.error);
            }
        } catch (e) {
            toast.error("Failed to create invoice");
        } finally {
            setLoading(false);
        }
    };

    const updateRate = (index: number, itemCode: string) => {
        const item = items.find(i => i.item_code === itemCode);
        if (item) {
            form.setValue(`items.${index}.rate`, item.standard_rate || 0);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>New Purchase Invoice</CardTitle>
                <CardDescription>Record a new bill from a supplier.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="supplier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Supplier" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {suppliers.map(s => (
                                                    <SelectItem key={s.name} value={s.name}>{s.supplier_name}</SelectItem>
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
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Card className="border-dashed">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-base">Items</CardTitle>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ item_code: "", qty: 1, rate: 0 })}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add Item
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="w-[100px]">Qty</TableHead>
                                            <TableHead className="w-[150px]">Rate</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.item_code`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <Select
                                                                    onValueChange={(val) => {
                                                                        field.onChange(val);
                                                                        updateRate(index, val);
                                                                    }}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select Item" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {items.map(item => (
                                                                            <SelectItem key={item.item_code} value={item.item_code}>
                                                                                {item.item_name} ({item.item_code})
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.qty`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <FormControl>
                                                                    <Input type="number" min="1" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.rate`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-0">
                                                                <FormControl>
                                                                    <Input type="number" min="0" step="0.01" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                create Invoice
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default function NewPurchaseInvoicePage() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
                <NewPurchaseInvoiceContent />
            </Suspense>
        </div>
    );
}
