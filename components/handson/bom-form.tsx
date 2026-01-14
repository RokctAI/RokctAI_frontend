"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBOM, BOMData, BOMItem } from "@/app/actions/handson/all/accounting/manufacturing/bom";
import { getCompanies } from "@/app/actions/handson/all/hrms/companies";
import { toast } from "sonner";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface BOMFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function BOMForm({ initialData, isEdit = false }: BOMFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Header
    const [item, setItem] = useState(initialData?.item || "");
    const [quantity, setQuantity] = useState(initialData?.quantity || 1);
    const [company, setCompany] = useState(initialData?.company || "Juvo");

    // Dynamic Options
    const [companies, setCompanies] = useState<any[]>([]);

    useEffect(() => {
        getCompanies().then(c => {
            setCompanies(c);
            if (c.length > 0 && !initialData?.company) setCompany(c[0].name);
        });
    }, [initialData]);

    // Items Table
    const [items, setItems] = useState<BOMItem[]>(initialData?.items || []);

    const addItem = () => {
        setItems([...items, { item_code: "", qty: 1 }]);
    };

    const updateItem = (index: number, field: keyof BOMItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!item) {
            toast.error("Production Item is required");
            return;
        }
        if (!company) {
            toast.error("Company is required");
            return;
        }
        if (items.length === 0) {
            toast.error("At least one Raw Material component is required");
            return;
        }

        setLoading(true);

        const payload: BOMData = {
            item,
            quantity: Number(quantity),
            company,
            items: items.map(i => ({
                item_code: i.item_code,
                qty: Number(i.qty)
            }))
        };

        if (isEdit) {
            toast.info("To maintain version history, please Cancel this BOM and create a new version instead of editing directly.");
            setLoading(false);
            return;
        }

        const result = await createBOM(payload);
        setLoading(false);

        if (result.success) {
            toast.success("BOM Created");
            router.push("/handson/all/supply_chain/manufacturing/bom");
            router.refresh();
        } else {
            toast.error("Failed: " + result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/handson/all/supply_chain/manufacturing/bom">
                        <Button variant="outline" size="icon" type="button">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{isEdit ? `View BOM: ${initialData.name}` : "New Bill of Materials"}</h1>
                </div>
                {!isEdit && (
                    <Button type="submit" disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Saving..." : "Save"}
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="item">Item to Manufacture</Label>
                        <Input
                            id="item"
                            placeholder="e.g. Finished Product X"
                            value={item}
                            onChange={(e) => setItem(e.target.value)}
                            readOnly={isEdit}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            readOnly={isEdit}
                        />
                    </div>
                    <div className="space-y-2 col-span-2">
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Raw Materials</CardTitle>
                    {!isEdit && (
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60%]">Item Code</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Input
                                            value={row.item_code}
                                            onChange={(e) => updateItem(index, 'item_code', e.target.value)}
                                            placeholder="Raw Material Item..."
                                            readOnly={isEdit}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={row.qty}
                                            onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                            readOnly={isEdit}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {!isEdit && (
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </form>
    );
}
