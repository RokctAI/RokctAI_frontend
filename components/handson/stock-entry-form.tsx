"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createStockEntry, getWarehouses } from "@/app/actions/handson/all/accounting/inventory/stock";
import { getCompanies } from "@/app/actions/handson/all/hrms/companies";
import { toast } from "sonner";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function StockEntryForm({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Dynamic Data
    const [companies, setCompanies] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    // Form State
    const [company, setCompany] = useState(initialData?.company || "Juvo");
    const [type, setType] = useState(initialData?.stock_entry_type || "Material Transfer");
    const [items, setItems] = useState<{ item_code: string, qty: number, s_warehouse?: string, t_warehouse?: string }[]>(initialData?.items || []);

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        async function fetchDefaults() {
            const [c, w] = await Promise.all([getCompanies(), getWarehouses()]);
            setCompanies(c);
            setWarehouses(w);
            if (c.length > 0 && !initialData?.company) setCompany(c[0].name);
        }
        fetchDefaults();
    }, [initialData]);

    const addItem = () => setItems([...items, { item_code: "", qty: 1 }]);
    const updateItem = (i: number, f: string, v: any) => {
        const n = [...items]; n[i] = { ...n[i], [f]: v }; setItems(n);
    };
    const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validation - Production Ready
        if (!company) { toast.error("Company is required"); setLoading(false); return; }
        if (items.length === 0) { toast.error("At least one item is required"); setLoading(false); return; }

        for (const item of items) {
            if (!item.item_code) { toast.error("Item Code is required"); setLoading(false); return; }
            if (type === "Material Transfer" && (!item.s_warehouse || !item.t_warehouse)) {
                toast.error("Source and Target Warehouses required for Transfer"); setLoading(false); return;
            }
            if (type === "Material Issue" && !item.s_warehouse) {
                toast.error("Source Warehouse required for Issue"); setLoading(false); return;
            }
            if (type === "Material Receipt" && !item.t_warehouse) {
                toast.error("Target Warehouse required for Receipt"); setLoading(false); return;
            }
        }

        const res = await createStockEntry({
            stock_entry_type: type, company, items
        });
        setLoading(false);
        if (res.success) {
            toast.success("Stock Entry Created");
            router.push("/handson/all/accounting/inventory/entry");
        } else {
            toast.error(res.error);
        }
    };

    if (!isClient) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between">
                <div className="flex gap-4 items-center">
                    <Link href="/handson/all/accounting/inventory/entry"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <h1 className="text-2xl font-bold">{isEdit ? `Entry ${initialData.name}` : "New Stock Entry"}</h1>
                </div>
                {!isEdit && <Button type="submit" disabled={loading}><Save className="mr-2 h-4 w-4" /> Save</Button>}
            </div>
            <Card>
                <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Entry Type</Label>
                        <Select value={type} onValueChange={setType} disabled={isEdit}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Material Issue">Material Issue (Out)</SelectItem>
                                <SelectItem value="Material Receipt">Material Receipt (In)</SelectItem>
                                <SelectItem value="Material Transfer">Material Transfer</SelectItem>
                                <SelectItem value="Manufacture">Manufacture</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Company</Label>
                        <Select value={company} onValueChange={setCompany} disabled={isEdit}>
                            <SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger>
                            <SelectContent>
                                {companies.map(c => <SelectItem key={c.name} value={c.name}>{c.company_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row justify-between"><CardTitle>Items</CardTitle>{!isEdit && <Button type="button" size="sm" onClick={addItem}><Plus className="h-4 w-4" /> Add</Button>}</CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Qty</TableHead>
                                {type !== "Material Receipt" && <TableHead>Source Warehouse</TableHead>}
                                {type !== "Material Issue" && <TableHead>Target Warehouse</TableHead>}
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell><Input value={row.item_code} onChange={e => updateItem(i, 'item_code', e.target.value)} readOnly={isEdit} placeholder="Item Code" /></TableCell>
                                    <TableCell><Input type="number" value={row.qty} onChange={e => updateItem(i, 'qty', e.target.value)} readOnly={isEdit} className="w-20" /></TableCell>

                                    {type !== "Material Receipt" && (
                                        <TableCell>
                                            <Select value={row.s_warehouse} onValueChange={v => updateItem(i, 's_warehouse', v)} disabled={isEdit}>
                                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Source" /></SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map(w => <SelectItem key={w.name} value={w.name}>{w.warehouse_name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    )}

                                    {type !== "Material Issue" && (
                                        <TableCell>
                                            <Select value={row.t_warehouse} onValueChange={v => updateItem(i, 't_warehouse', v)} disabled={isEdit}>
                                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Target" /></SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map(w => <SelectItem key={w.name} value={w.name}>{w.warehouse_name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    )}

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
