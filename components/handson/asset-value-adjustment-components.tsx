"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { createAssetValueAdjustment } from "@/app/actions/handson/all/accounting/assets/value_adjustment/createAssetValueAdjustment";
import { toast } from "sonner";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function AssetValueAdjustmentList({ items }: { items: any[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Asset Revaluation</h1><p className="text-muted-foreground">Adjust asset values.</p></div>
                <Link href="/handson/all/financials/assets/value-adjustment/new"><Button><Plus className="mr-2 h-4 w-4" /> New Adjustment</Button></Link>
            </div>
            <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Asset</TableHead><TableHead>Date</TableHead><TableHead>New Value</TableHead></TableRow></TableHeader>
                <TableBody>{items.map(o => <TableRow key={o.name}><TableCell>{o.name}</TableCell><TableCell>{o.asset}</TableCell><TableCell>{o.date}</TableCell><TableCell>{o.new_asset_value}</TableCell></TableRow>)}</TableBody>
            </Table>
        </div>
    );
}

export function AssetValueAdjustmentForm() {
    const router = useRouter();
    const [asset, setAsset] = useState("");
    const [newValue, setNewValue] = useState(0);

    const handleSubmit = async () => {
        const res = await createAssetValueAdjustment({
            asset, date: new Date().toISOString().split('T')[0],
            current_asset_value: 100,
            new_asset_value: newValue
        });
        if (res.success) { toast.success("Created"); router.push("/handson/all/financials/assets/value-adjustment"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Adjust Value</h1>
            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div><Label>Asset</Label><Input value={asset} onChange={e => setAsset(e.target.value)} /></div>
                    <div><Label>New Value</Label><Input type="number" value={newValue} onChange={e => setNewValue(Number(e.target.value))} /></div>
                    <Button onClick={handleSubmit}>Save</Button>
                </CardContent>
            </Card>
        </div>
    );
}
