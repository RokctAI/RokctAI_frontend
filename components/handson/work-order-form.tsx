"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createWorkOrder, WorkOrderData } from "@/app/actions/handson/all/accounting/manufacturing/work_order";
import { toast } from "sonner";
import Link from "next/link";

interface WorkOrderFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function WorkOrderForm({ initialData, isEdit = false }: WorkOrderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [productionItem, setProductionItem] = useState(initialData?.production_item || "");
    const [bomNo, setBomNo] = useState(initialData?.bom_no || "");
    const [qty, setQty] = useState(initialData?.qty || 1);
    const [startDate, setStartDate] = useState(initialData?.planned_start_date || new Date().toISOString().split('T')[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!productionItem || !bomNo || !qty || !startDate) {
            toast.error("All fields (Item, BOM, Qty, Date) are required");
            return;
        }

        setLoading(true);

        const payload: WorkOrderData = {
            production_item: productionItem,
            bom_no: bomNo,
            qty: Number(qty),
            planned_start_date: startDate,
            company: "Juvo" // Mandatory
        };

        let result;
        if (isEdit) {
            // Update not implemented
            toast.error("Updating Work Orders not active yet.");
            setLoading(false);
            return;
        } else {
            result = await createWorkOrder(payload);
        }

        setLoading(false);

        if (result.success) {
            toast.success("Work Order Created");
            router.push("/handson/all/supply_chain/manufacturing/work-order");
            router.refresh();
        } else {
            toast.error("Failed: " + result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/handson/all/supply_chain/manufacturing/work-order">
                        <Button variant="outline" size="icon" type="button">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{isEdit ? `View Work Order: ${initialData.name}` : "New Work Order"}</h1>
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
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="item">Item to Manufacture</Label>
                        <Input
                            id="item"
                            placeholder="e.g. Finished Product X"
                            value={productionItem}
                            onChange={(e) => setProductionItem(e.target.value)}
                            readOnly={isEdit}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bom">BOM No.</Label>
                        <Input
                            id="bom"
                            placeholder="e.g. BOM-Item-001"
                            value={bomNo}
                            onChange={(e) => setBomNo(e.target.value)}
                            readOnly={isEdit}
                        />
                        <p className="text-xs text-muted-foreground">Enter the BOM Name accurately.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="qty">Quantity</Label>
                            <Input
                                id="qty"
                                type="number"
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                readOnly={isEdit}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Planned Start Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                readOnly={isEdit}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
