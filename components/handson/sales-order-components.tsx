"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { createSalesOrder } from "@/app/actions/handson/all/accounting/selling/sales_order";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function SalesOrderList({ orders }: { orders: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const filtered = orders.filter(o => o.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Sales Orders</h1><p className="text-muted-foreground">Confirmed orders from Customers.</p></div>
                <div className="flex gap-4">
                    <Link href="/handson/all/commercial/selling/sales-order/new"><Button><Plus className="mr-2 h-4 w-4" /> New Order</Button></Link>
                </div>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {filtered.map(o => (
                            <TableRow key={o.name}>
                                <TableCell>{o.name}</TableCell>
                                <TableCell>{o.customer}</TableCell>
                                <TableCell>{o.transaction_date}</TableCell>
                                <TableCell>{o.grand_total}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export function SalesOrderForm() {
    const router = useRouter();
    const [customer, setCustomer] = useState("");
    const [item, setItem] = useState("");
    const [qty, setQty] = useState(1);

    const handleSubmit = async () => {
        const res = await createSalesOrder({
            customer, company: "Juvo", transaction_date: new Date().toISOString().split('T')[0],
            items: [{ item_code: item, qty }]
        });
        if (res.success) { toast.success("Order Created"); router.push("/handson/all/commercial/selling/sales-order"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-between"><h1 className="text-2xl font-bold">New Sales Order</h1><Button onClick={handleSubmit}>Save</Button></div>
            <Card>
                <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div><Label>Customer</Label><Input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Customer Name" /></div>
                    <div className="flex gap-4">
                        <div className="flex-1"><Label>Item</Label><Input value={item} onChange={e => setItem(e.target.value)} placeholder="Item Code" /></div>
                        <div className="w-32"><Label>Qty</Label><Input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} /></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
