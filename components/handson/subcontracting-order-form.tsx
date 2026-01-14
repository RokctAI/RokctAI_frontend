"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSubcontractingOrder } from "@/app/actions/handson/all/accounting/buying/subcontracting";
import { toast } from "sonner";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SubcontractingOrderForm({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [supplier, setSupplier] = useState(initialData?.supplier || "");
    const [items, setItems] = useState<{ item_code: string, qty: number }[]>(initialData?.items || []);

    const addItem = () => setItems([...items, { item_code: "", qty: 1 }]);
    const updateItem = (i: number, f: string, v: any) => {
        const n = [...items]; n[i] = { ...n[i], [f]: v }; setItems(n);
    };
    const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await createSubcontractingOrder({
            supplier, company: "Juvo", items, transaction_date: new Date().toISOString().split('T')[0]
        });
        setLoading(false);
        if (res.success) {
            toast.success("Order Created");
            router.push("/handson/all/supply_chain/subcontracting/order");
        } else {
            toast.error(res.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between">
                <div className="flex gap-4 items-center">
                    <Link href="/handson/all/supply_chain/subcontracting/order"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <h1 className="text-2xl font-bold">{isEdit ? `Order ${initialData.name}` : "New Subcontracting Order"}</h1>
                </div>
                {!isEdit && <Button type="submit" disabled={loading}><Save className="mr-2 h-4 w-4" /> Save</Button>}
            </div>
            <Card>
                <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                <CardContent>
                    <Label>Supplier (Job Worker)</Label>
                    <Input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier Name" readOnly={isEdit} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row justify-between"><CardTitle>Items</CardTitle>{!isEdit && <Button type="button" size="sm" onClick={addItem}><Plus className="h-4 w-4" /> Add</Button>}</CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {items.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell><Input value={row.item_code} onChange={e => updateItem(i, 'item_code', e.target.value)} readOnly={isEdit} /></TableCell>
                                    <TableCell><Input type="number" value={row.qty} onChange={e => updateItem(i, 'qty', e.target.value)} readOnly={isEdit} /></TableCell>
                                    <TableCell>{!isEdit && <Button type="button" variant="ghost" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4" /></Button>}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </form>
    );
}
