"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PurchaseReceiptList({ receipts }: { receipts: any[] }) {
    return (
        <div>
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Purchase Receipts</h1>
                <Link href="/handson/all/supply_chain/buying/receipt/new"><Button><Plus className="mr-2 h-4 w-4" /> Receive Goods</Button></Link>
            </div>
            <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Supplier</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                <TableBody>{receipts.map(r => <TableRow key={r.name}><TableCell>{r.name}</TableCell><TableCell>{r.supplier}</TableCell><TableCell>{r.posting_date}</TableCell><TableCell>{r.grand_total}</TableCell></TableRow>)}</TableBody>
            </Table>
        </div>
    );
}

// Minimal Form for brevity, assuming similar structure to others
import { useRouter } from "next/navigation";
import { createPurchaseReceipt } from "@/app/actions/handson/all/accounting/buying/receipt";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export function PurchaseReceiptForm() {
    const router = useRouter();
    const [supplier, setSupplier] = useState("");
    const [item, setItem] = useState("");
    const [qty, setQty] = useState(1);
    const [rate, setRate] = useState(0);

    const handleSubmit = async () => {
        const res = await createPurchaseReceipt({
            supplier, company: "Juvo", posting_date: new Date().toISOString().split('T')[0],
            items: [{ item_code: item, qty: qty, rate: rate }]
        });
        if (res.success) { toast.success("Received"); router.push("/handson/all/supply_chain/buying/receipt"); }
        else toast.error(res.error || "Failed");
    };

    return (
        <div className="max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">New Purchase Receipt</h1>
            <div className="space-y-2 border p-4 rounded bg-white">
                <div><label className="text-sm font-medium">Supplier</label><Input placeholder="Supplier Name" value={supplier} onChange={e => setSupplier(e.target.value)} /></div>
                <div><label className="text-sm font-medium">Item Code</label><Input placeholder="Item Code" value={item} onChange={e => setItem(e.target.value)} /></div>
                <div className="flex gap-4">
                    <div className="flex-1"><label className="text-sm font-medium">Qty</label><Input type="number" placeholder="Qty" value={qty} onChange={e => setQty(Number(e.target.value))} /></div>
                    <div className="flex-1"><label className="text-sm font-medium">Rate</label><Input type="number" placeholder="Rate" value={rate} onChange={e => setRate(Number(e.target.value))} /></div>
                </div>
            </div>
            <Button onClick={handleSubmit} className="w-full">Create Receipt</Button>
        </div>
    );
}
