"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { createDeliveryNote } from "@/app/actions/handson/all/accounting/selling/delivery_note";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export function DeliveryNoteList({ notes }: { notes: any[] }) {
    return (
        <div>
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Delivery Notes</h1>
                <Link href="/handson/all/commercial/selling/delivery-note/new"><Button><Plus className="mr-2 h-4 w-4" /> Ship Goods</Button></Link>
            </div>
            <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                <TableBody>{notes.map(n => <TableRow key={n.name}><TableCell>{n.name}</TableCell><TableCell>{n.customer}</TableCell><TableCell>{n.posting_date}</TableCell><TableCell>{n.grand_total}</TableCell></TableRow>)}</TableBody>
            </Table>
        </div>
    );
}

export function DeliveryNoteForm() {
    const router = useRouter();
    const [customer, setCustomer] = useState("");

    const handleSubmit = async () => {
        const res = await createDeliveryNote({
            customer, company: "Juvo", posting_date: new Date().toISOString().split('T')[0],
            items: [{ item_code: "Test", qty: 1 }]
        });
        if (res.success) { toast.success("Shipped"); router.push("/handson/all/commercial/selling/delivery-note"); }
    };

    return (
        <div className="max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">New Delivery</h1>
            <Input placeholder="Customer" value={customer} onChange={e => setCustomer(e.target.value)} />
            <Button onClick={handleSubmit}>Save Delivery</Button>
        </div>
    );
}
