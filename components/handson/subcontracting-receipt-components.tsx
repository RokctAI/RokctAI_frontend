"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createSubcontractingReceipt } from "@/app/actions/handson/all/accounting/buying/subcontracting";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function SubcontractingReceiptList({ receipts }: { receipts: any[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Subcontracting Receipts</h1><p className="text-muted-foreground">Receive processed items.</p></div>
                <Link href="/handson/all/supply_chain/subcontracting/receipt/new"><Button><Plus className="mr-2 h-4 w-4" /> New Receipt</Button></Link>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Supplier</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {receipts.map(r => (
                            <TableRow key={r.name}>
                                <TableCell>{r.name}</TableCell>
                                <TableCell>{r.supplier}</TableCell>
                                <TableCell>{r.posting_date}</TableCell>
                                <TableCell>{r.grand_total}</TableCell>
                                <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export function SubcontractingReceiptForm() {
    const router = useRouter();
    const [supplier, setSupplier] = useState("");
    const [item, setItem] = useState("");
    const [qty, setQty] = useState(1);
    const [rate, setRate] = useState(0);

    const handleSubmit = async () => {
        const res = await createSubcontractingReceipt({
            supplier,
            items: [{ item_code: item, qty, rate }]
        });
        if (res.success) { toast.success("Receipt Created"); router.push("/handson/all/supply_chain/subcontracting/receipt"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">New Subcontracting Receipt</h1>
            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div><Label>Supplier (Job Worker)</Label><Input value={supplier} onChange={e => setSupplier(e.target.value)} /></div>
                    <div className="flex gap-4">
                        <div className="flex-1"><Label>Item Code</Label><Input value={item} onChange={e => setItem(e.target.value)} /></div>
                        <div className="w-24"><Label>Qty</Label><Input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} /></div>
                        <div className="w-32"><Label>Rate</Label><Input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} /></div>
                    </div>
                    <Button onClick={handleSubmit}>Create Receipt</Button>
                </CardContent>
            </Card>
        </div>
    );
}
