"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getBlanketOrders, createBlanketOrder } from "@/app/actions/handson/all/accounting/buying/order";
import { getSuppliers } from "@/app/actions/handson/all/accounting/buying/supplier";
import { getItems } from "@/app/actions/handson/all/accounting/inventory/item";

export function BlanketOrderList() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        getBlanketOrders().then(data => {
            setOrders(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-center p-4"><Loader2 className="animate-spin inline mr-2" />Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Blanket Orders</h2>
                <Button onClick={() => router.push("/handson/all/supply_chain/buying/blanket-order/new")}>
                    <Plus className="mr-2 h-4 w-4" /> New Blanket Order
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>To Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No blanket orders found.</TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.name}>
                                        <TableCell className="font-medium">{order.name}</TableCell>
                                        <TableCell>{order.supplier}</TableCell>
                                        <TableCell>{order.to_date}</TableCell>
                                        <TableCell>{order.status}</TableCell>
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

export function BlanketOrderForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        supplier: "",
        to_date: "",
        items: [{ item_code: "", qty: 1, rate: 0 }]
    });

    useEffect(() => {
        getSuppliers().then(setSuppliers);
        getItems().then(setItems);
    }, []);

    const handleAddItem = () => {
        setFormData({ ...formData, items: [...formData.items, { item_code: "", qty: 1, rate: 0 }] });
    };

    const handleSubmit = async () => {
        if (!formData.supplier) { toast.error("Select supplier"); return; }
        setLoading(true);
        const res = await createBlanketOrder(formData);
        if (res.success) {
            toast.success("Blanket Order Created");
            router.push("/handson/all/supply_chain/buying/blanket-order");
        } else {
            toast.error("Failed: " + res.error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
                <h1 className="text-2xl font-bold">New Blanket Order</h1>
            </div>
            <Card>
                <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Supplier</Label>
                            <Select value={formData.supplier} onValueChange={v => setFormData({ ...formData, supplier: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                                <SelectContent>
                                    {suppliers.map(s => <SelectItem key={s.name} value={s.name}>{s.supplier_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Valid To</Label>
                            <Input type="date" value={formData.to_date} onChange={e => setFormData({ ...formData, to_date: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Items</h3>
                            <Button variant="outline" size="sm" onClick={handleAddItem}><Plus className="h-4 w-4 mr-2" /> Add Item</Button>
                        </div>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="w-[100px]">Qty</TableHead>
                                        <TableHead className="w-[150px]">Rate</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.items.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <Select value={item.item_code} onValueChange={v => {
                                                    const newItems = [...formData.items];
                                                    newItems[idx].item_code = v;
                                                    setFormData({ ...formData, items: newItems });
                                                }}>
                                                    <SelectTrigger><SelectValue placeholder="Item" /></SelectTrigger>
                                                    <SelectContent>
                                                        {items.map(i => <SelectItem key={i.item_code} value={i.item_code}>{i.item_name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" value={item.qty} onChange={e => {
                                                    const newItems = [...formData.items];
                                                    newItems[idx].qty = parseFloat(e.target.value);
                                                    setFormData({ ...formData, items: newItems });
                                                }} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" value={item.rate} onChange={e => {
                                                    const newItems = [...formData.items];
                                                    newItems[idx].rate = parseFloat(e.target.value);
                                                    setFormData({ ...formData, items: newItems });
                                                }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Create Blanket Order"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
