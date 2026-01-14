"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createPurchaseInvoice } from "@/app/actions/handson/all/accounting/purchases/createPurchaseInvoice";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function PurchaseInvoiceList({ invoices }: { invoices: any[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Purchase Invoices</h1><p className="text-muted-foreground">Bills from Suppliers.</p></div>
                <Link href="/handson/all/financials/accounts/purchase-invoice/new"><Button><Plus className="mr-2 h-4 w-4" /> New Invoice</Button></Link>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Supplier</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {invoices.map(inv => (
                            <TableRow key={inv.name}>
                                <TableCell>{inv.name}</TableCell>
                                <TableCell>{inv.supplier_name}</TableCell>
                                <TableCell>{inv.posting_date}</TableCell>
                                <TableCell>{inv.grand_total}</TableCell>
                                <TableCell><Badge variant="outline">{inv.status}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export function PurchaseInvoiceForm() {
    const router = useRouter();
    const [supplier, setSupplier] = useState("");
    const [item, setItem] = useState("");
    const [qty, setQty] = useState(1);
    const [rate, setRate] = useState(0);

    const handleSubmit = async () => {
        const res = await createPurchaseInvoice({
            supplier, posting_date: new Date().toISOString().split('T')[0],
            items: [{ item_code: item, qty, rate }]
        });
        if (res.success) { toast.success("Invoice Created"); router.push("/handson/all/financials/accounts/purchase-invoice"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">New Purchase Invoice</h1>
            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div><Label>Supplier</Label><Input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier Name" /></div>
                    <div className="flex gap-4">
                        <div className="flex-1"><Label>Item</Label><Input value={item} onChange={e => setItem(e.target.value)} /></div>
                        <div className="w-24"><Label>Qty</Label><Input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} /></div>
                        <div className="w-32"><Label>Rate</Label><Input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} /></div>
                    </div>
                    <Button onClick={handleSubmit}>Create Invoice</Button>
                </CardContent>
            </Card>
        </div>
    );
}
