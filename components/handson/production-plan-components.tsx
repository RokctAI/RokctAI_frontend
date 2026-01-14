"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createProductionPlan } from "@/app/actions/handson/all/accounting/manufacturing/production_plan";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function ProductionPlanList({ plans }: { plans: any[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Production Plans</h1><p className="text-muted-foreground">Plan manufacturing batches.</p></div>
                <Link href="/handson/all/supply_chain/manufacturing/production-plan/new"><Button><Plus className="mr-2 h-4 w-4" /> New Plan</Button></Link>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Company</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {plans.map(p => (
                            <TableRow key={p.name}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.company}</TableCell>
                                <TableCell>{p.posting_date}</TableCell>
                                <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export function ProductionPlanForm() {
    const router = useRouter();
    const [item, setItem] = useState("");
    const [qty, setQty] = useState(1);

    const handleSubmit = async () => {
        const res = await createProductionPlan({
            company: "Juvo",
            posting_date: new Date().toISOString().split('T')[0],
            po_items: [{ item_code: item, planned_qty: qty }]
        });
        if (res.success) { toast.success("Plan Created"); router.push("/handson/all/supply_chain/manufacturing/production-plan"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">New Production Plan</h1>
            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div className="flex gap-4">
                        <div className="flex-1"><Label>Item Code</Label><Input value={item} onChange={e => setItem(e.target.value)} /></div>
                        <div className="w-32"><Label>Planned Qty</Label><Input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} /></div>
                    </div>
                    <Button onClick={handleSubmit}>Create Plan</Button>
                </CardContent>
            </Card>
        </div>
    );
}
