"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPurchaseOrder, updatePurchaseOrder, PurchaseOrderData, PurchaseOrderItem } from "@/app/actions/handson/all/accounting/buying/order";
import { toast } from "sonner";
import Link from "next/link";

interface PurchaseOrderFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function PurchaseOrderForm({ initialData, isEdit = false }: PurchaseOrderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [supplier, setSupplier] = useState(initialData?.supplier || "");
    const [transactionDate, setTransactionDate] = useState(initialData?.transaction_date || new Date().toISOString().split('T')[0]);

    const [items, setItems] = useState<PurchaseOrderItem[]>(
        initialData?.items?.map((i: any) => ({
            item_code: i.item_code,
            qty: i.qty,
            rate: i.rate
        })) || []
    );

    const addItem = () => {
        setItems([...items, { item_code: "", qty: 1, rate: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.rate)), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!supplier) {
            toast.error("Supplier is required");
            return;
        }

        if (items.length === 0) {
            toast.error("Please add at least one item");
            return;
        }

        const invalidItems = items.some(i => !i.item_code || i.qty <= 0);
        if (invalidItems) {
            toast.error("All items must have a code and valid quantity");
            return;
        }

        setLoading(true);

        const payload: PurchaseOrderData = {
            supplier,
            transaction_date: transactionDate,
            items: items.map(i => ({
                item_code: i.item_code,
                qty: Number(i.qty),
                rate: Number(i.rate)
            }))
        };

        let result;
        if (isEdit && initialData?.name) {
            result = await updatePurchaseOrder(initialData.name, payload);
        } else {
            result = await createPurchaseOrder(payload);
        }

        setLoading(false);

        if (result.success) {
            toast.success(isEdit ? "Purchase Order updated" : "Purchase Order created");
            router.push("/handson/all/supply_chain/buying");
            router.refresh();
        } else {
            toast.error("Failed: " + result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/handson/all/supply_chain/buying">
                        <Button variant="outline" size="icon" type="button">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{isEdit ? `Edit Order: ${initialData.name}` : "New Purchase Order"}</h1>
                </div>
                <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Save"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="supplier">Supplier</Label>
                        <Input
                            id="supplier"
                            placeholder="e.g. Test Supplier"
                            value={supplier}
                            onChange={(e) => setSupplier(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Type exact Supplier Name</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={transactionDate}
                            onChange={(e) => setTransactionDate(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Items</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Item Code</TableHead>
                                <TableHead className="w-[20%]">Quantity</TableHead>
                                <TableHead className="w-[20%]">Rate</TableHead>
                                <TableHead className="w-[10%] text-right">Amount</TableHead>
                                <TableHead className="w-[10%]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No items added.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Input
                                                placeholder="Item Code"
                                                value={item.item_code}
                                                onChange={(e) => updateItem(index, 'item_code', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.qty}
                                                onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.rate}
                                                onChange={(e) => updateItem(index, 'rate', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {(Number(item.qty) * Number(item.rate)).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => removeItem(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <div className="flex justify-end mt-4">
                        <div className="flex gap-8 text-lg font-bold">
                            <span>Total:</span>
                            <span>{calculateTotal().toLocaleString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
