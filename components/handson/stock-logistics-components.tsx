"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getPickLists, createPickList, getShipments, createShipment } from "@/app/actions/handson/all/accounting/inventory/logistics";
import { getItems } from "@/app/actions/handson/all/accounting/inventory/item";

// --- PICK LIST ---

export function PickListList() {
    const [lists, setLists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => { getPickLists().then(d => { setLists(d); setLoading(false); }); }, []);

    if (loading) return <div className="text-center p-4"><Loader2 className="animate-spin inline mr-2" />Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Pick Lists</h2>
                <Button onClick={() => router.push("/handson/all/supply_chain/stock/pick-list/new")}>
                    <Plus className="mr-2 h-4 w-4" /> New Pick List
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Purpose</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {lists.map(l => (
                                <TableRow key={l.name}><TableCell className="font-medium">{l.name}</TableCell><TableCell>{l.purpose}</TableCell><TableCell>{l.status}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export function PickListForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        purpose: "Material Transfer for Manufacture",
        locations: [{ item_code: "", qty: 1, warehouse: "" }]
    });

    useEffect(() => { getItems().then(setItems); }, []);

    const handleSubmit = async () => {
        setLoading(true);
        const res = await createPickList(formData);
        if (res.success) { toast.success("Pick List Created"); router.push("/handson/all/supply_chain/stock/pick-list"); }
        else toast.error("Failed: " + res.error);
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button><h1 className="text-2xl font-bold">New Pick List</h1></div>
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <Label>Purpose</Label>
                        <Select value={formData.purpose} onValueChange={v => setFormData({ ...formData, purpose: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Material Transfer for Manufacture">Material Transfer for Manufacture</SelectItem><SelectItem value="Delivery">Delivery</SelectItem></SelectContent>
                        </Select>
                    </div>
                    {/* Simplified Item Input for demo */}
                    <div className="space-y-2">
                        <Label>Item to Pick</Label>
                        <Select value={formData.locations[0].item_code} onValueChange={v => setFormData({ ...formData, locations: [{ ...formData.locations[0], item_code: v }] })}>
                            <SelectTrigger><SelectValue placeholder="Select Item" /></SelectTrigger>
                            <SelectContent>{items.map(i => <SelectItem key={i.item_code} value={i.item_code}>{i.item_name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2"><Label>Qty</Label><Input type="number" value={formData.locations[0].qty} onChange={e => setFormData({ ...formData, locations: [{ ...formData.locations[0], qty: parseFloat(e.target.value) }] })} /></div>
                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : "Create Pick List"}</Button>
                </CardContent>
            </Card>
        </div>
    );
}

// --- SHIPMENT ---

export function ShipmentList() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => { getShipments().then(d => { setList(d); setLoading(false); }); }, []);

    if (loading) return <div className="text-center p-4"><Loader2 className="animate-spin inline mr-2" />Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Shipments</h2><Button onClick={() => router.push("/handson/all/supply_chain/stock/shipment/new")}><Plus className="mr-2 h-4 w-4" /> New Shipment</Button></div>
            <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Carrier</TableHead><TableHead>Tracking</TableHead></TableRow></TableHeader><TableBody>{list.map(l => <TableRow key={l.name}><TableCell className="font-medium">{l.name}</TableCell><TableCell>{l.carrier}</TableCell><TableCell>{l.tracking_number}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        </div>
    );
}

export function ShipmentForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ delivery_from_type: "Delivery Note", delivery_from: "", carrier: "DHL", tracking_number: "" });

    const handleSubmit = async () => {
        setLoading(true);
        const res = await createShipment(formData);
        if (res.success) { toast.success("Shipment Created"); router.push("/handson/all/supply_chain/stock/shipment"); }
        else toast.error("Failed: " + res.error);
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button><h1 className="text-2xl font-bold">New Shipment</h1></div>
            <Card><CardContent className="space-y-4 pt-6">
                <div className="space-y-2"><Label>Carrier</Label><Input value={formData.carrier} onChange={e => setFormData({ ...formData, carrier: e.target.value })} /></div>
                <div className="space-y-2"><Label>Tracking Number</Label><Input value={formData.tracking_number} onChange={e => setFormData({ ...formData, tracking_number: e.target.value })} /></div>
                <div className="space-y-2"><Label>Delivery Note ID</Label><Input value={formData.delivery_from} onChange={e => setFormData({ ...formData, delivery_from: e.target.value })} placeholder="DN-202X-XXXX" /></div>
                <Button className="w-full" onClick={handleSubmit} disabled={loading}>Create Shipment</Button>
            </CardContent></Card>
        </div>
    );
}
