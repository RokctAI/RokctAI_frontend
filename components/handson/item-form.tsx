"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createItem, updateItem, ItemData } from "@/app/actions/handson/all/accounting/inventory/item";
import { toast } from "sonner";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ItemFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function ItemForm({ initialData, isEdit = false }: ItemFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [itemCode, setItemCode] = useState(initialData?.item_code || "");
    const [itemName, setItemName] = useState(initialData?.item_name || "");
    const [itemGroup, setItemGroup] = useState(initialData?.item_group || "Products");
    const [stockUom, setStockUom] = useState(initialData?.stock_uom || "Nos");
    const [standardRate, setStandardRate] = useState(initialData?.standard_rate || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!itemCode || !itemName) {
            toast.error("Item Code and Name are required");
            return;
        }

        setLoading(true);

        const payload: ItemData = {
            item_code: itemCode,
            item_name: itemName,
            item_group: itemGroup,
            stock_uom: stockUom,
            standard_rate: Number(standardRate)
        };

        let result;
        if (isEdit) {
            result = await updateItem(itemCode, payload); // itemCode is usually PK and immutable, but passing it as name ID
        } else {
            result = await createItem(payload);
        }

        setLoading(false);

        if (result.success) {
            toast.success(isEdit ? "Item updated" : "Item created");
            router.push("/handson/all/supply_chain/stock");
            router.refresh();
        } else {
            toast.error("Failed: " + result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/handson/all/supply_chain/stock">
                        <Button variant="outline" size="icon" type="button">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{isEdit ? `Edit Item: ${initialData.item_code}` : "New Item"}</h1>
                </div>
                <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Save"}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Item Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="itemCode">Item Code</Label>
                        <Input
                            id="itemCode"
                            placeholder="e.g. ITEM-001"
                            value={itemCode}
                            onChange={(e) => setItemCode(e.target.value)}
                            disabled={isEdit} // Primary keys usually hard to change in Frappe
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="itemName">Item Name</Label>
                        <Input
                            id="itemName"
                            placeholder="e.g. Premium Widget"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Item Group</Label>
                            <Select value={itemGroup} onValueChange={setItemGroup}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Products">Products</SelectItem>
                                    <SelectItem value="Services">Services</SelectItem>
                                    <SelectItem value="Consumables">Consumables</SelectItem>
                                    <SelectItem value="Raw Material">Raw Material</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Unit of Measure (UOM)</Label>
                            <Select value={stockUom} onValueChange={setStockUom}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select UOM" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Nos">Nos</SelectItem>
                                    <SelectItem value="Kg">Kg</SelectItem>
                                    <SelectItem value="Ltr">Ltr</SelectItem>
                                    <SelectItem value="Box">Box</SelectItem>
                                    <SelectItem value="Hour">Hour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="standardRate">Standard Selling Rate</Label>
                        <Input
                            id="standardRate"
                            type="number"
                            step="0.01"
                            value={standardRate}
                            onChange={(e) => setStandardRate(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
