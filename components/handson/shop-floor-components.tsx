"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { createShopFloorItem } from "@/app/actions/handson/all/accounting/manufacturing/shop_floor";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// --- GENERIC LIST ---
export function ShopFloorList({ title, items, newItemUrl, headers, renderRow }: any) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">{title}</h1></div>
                <Link href={newItemUrl}><Button><Plus className="mr-2 h-4 w-4" /> New</Button></Link>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow>{headers.map((h: any) => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
                    <TableBody>{items.map((item: any) => renderRow(item))}</TableBody>
                </Table>
            </div>
        </div>
    );
}

// --- WORKSTATION ---
export function WorkstationForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const handleSubmit = async () => {
        const res = await createShopFloorItem({ doctype: "Workstation", workstation_name: name });
        if (res.success) { toast.success("Created"); router.push("/handson/all/supply_chain/manufacturing/shop-floor/workstation"); } else toast.error(res.error);
    };
    return (<div className="max-w-md mx-auto"><Card><CardContent className="pt-4"><Label>Workstation Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="mb-4" /><Button onClick={handleSubmit}>Save</Button></CardContent></Card></div>);
}

// --- OPERATION ---
export function OperationForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const handleSubmit = async () => {
        // Operation uses 'name' as its ID typically
        const res = await createShopFloorItem({ doctype: "Operation", name: name });
        if (res.success) { toast.success("Created"); router.push("/handson/all/supply_chain/manufacturing/shop-floor/operation"); } else toast.error(res.error);
    };
    return (<div className="max-w-md mx-auto"><Card><CardContent className="pt-4"><Label>Operation Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="mb-4" /><Button onClick={handleSubmit}>Save</Button></CardContent></Card></div>);
}

// --- JOB CARD ---
export function JobCardForm() {
    const router = useRouter();
    const [wo, setWO] = useState("");
    const [op, setOp] = useState("");
    const [ws, setWs] = useState("");
    const handleSubmit = async () => {
        const res = await createShopFloorItem({ doctype: "Job Card", work_order: wo, operation: op, workstation: ws, status: "Open" });
        if (res.success) { toast.success("Created"); router.push("/handson/all/supply_chain/manufacturing/shop-floor/job-card"); } else toast.error(res.error);
    };
    return (
        <div className="max-w-md mx-auto"><Card><CardContent className="pt-4 space-y-4">
            <div><Label>Work Order</Label><Input value={wo} onChange={e => setWO(e.target.value)} /></div>
            <div><Label>Operation</Label><Input value={op} onChange={e => setOp(e.target.value)} /></div>
            <div><Label>Workstation</Label><Input value={ws} onChange={e => setWs(e.target.value)} /></div>
            <Button onClick={handleSubmit}>Create Job Card</Button>
        </CardContent></Card></div>
    );
}

// --- DOWNTIME ENTRY ---
export function DowntimeEntryForm() {
    const router = useRouter();
    const [ws, setWs] = useState("");
    const [reason, setReason] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const handleSubmit = async () => {
        const res = await createShopFloorItem({ doctype: "Downtime Entry", workstation: ws, stop_reason: reason, from_time: from, to_time: to });
        if (res.success) { toast.success("Logged"); router.push("/handson/all/supply_chain/manufacturing/shop-floor/downtime"); } else toast.error(res.error);
    };
    return (
        <div className="max-w-md mx-auto"><Card><CardContent className="pt-4 space-y-4">
            <div><Label>Workstation</Label><Input value={ws} onChange={e => setWs(e.target.value)} /></div>
            <div><Label>Reason</Label><Input value={reason} onChange={e => setReason(e.target.value)} /></div>
            <div className="flex gap-2">
                <div className="flex-1"><Label>From</Label><Input type="datetime-local" value={from} onChange={e => setFrom(e.target.value)} /></div>
                <div className="flex-1"><Label>To</Label><Input type="datetime-local" value={to} onChange={e => setTo(e.target.value)} /></div>
            </div>
            <Button onClick={handleSubmit}>Log Downtime</Button>
        </CardContent></Card></div>
    );
}
