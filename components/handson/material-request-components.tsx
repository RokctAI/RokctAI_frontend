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
import { getMaterialRequests, createMaterialRequest } from "@/app/actions/handson/all/accounting/inventory/logistics";
import { getItems } from "@/app/actions/handson/all/accounting/inventory/item";

export function MaterialRequestList() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        getMaterialRequests().then(data => {
            setRequests(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-center p-4"><Loader2 className="animate-spin inline mr-2" />Loading requests...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Material Requests</h2>
                <Button onClick={() => router.push("/handson/all/supply_chain/stock/material-request/new")}>
                    <Plus className="mr-2 h-4 w-4" /> New Request
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No material requests found.</TableCell>
                                </TableRow>
                            ) : (
                                requests.map((req) => (
                                    <TableRow key={req.name}>
                                        <TableCell className="font-medium">{req.name}</TableCell>
                                        <TableCell>{req.material_request_type}</TableCell>
                                        <TableCell>{req.transaction_date}</TableCell>
                                        <TableCell>{req.status}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export function MaterialRequestForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        transaction_date: new Date().toISOString().split('T')[0],
        material_request_type: "Purchase",
        items: [{ item_code: "", qty: 1, schedule_date: new Date().toISOString().split('T')[0] }]
    });

    useEffect(() => {
        getItems().then(data => setItems(data));
    }, []);

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { item_code: "", qty: 1, schedule_date: formData.transaction_date }]
        });
    };

    const handleSubmit = async () => {
        if (!formData.items.every(i => i.item_code)) {
            toast.error("Please select items");
            return;
        }
        setLoading(true);
        const res = await createMaterialRequest(formData);
        if (res.success) {
            toast.success("Material Request Created");
            router.push("/handson/all/supply_chain/stock/material-request");
        } else {
            toast.error("Failed to create request: " + res.error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
                <h1 className="text-2xl font-bold">New Material Request</h1>
            </div>

            <Card>
                <CardHeader><CardTitle>Request Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={formData.transaction_date} onChange={e => setFormData({ ...formData, transaction_date: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={formData.material_request_type} onValueChange={v => setFormData({ ...formData, material_request_type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Purchase">Purchase</SelectItem>
                                    <SelectItem value="Material Transfer">Material Transfer</SelectItem>
                                    <SelectItem value="Material Issue">Material Issue</SelectItem>
                                    <SelectItem value="Manufacture">Manufacture</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Items</h3>
                            <Button variant="outline" size="sm" onClick={handleAddItem}><Plus className="h-4 w-4 mr-2" /> Add Item</Button>
                        </div>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="w-[100px]">Qty</TableHead>
                                        <TableHead className="w-[150px]">Required By</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.items.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <Select value={item.item_code} onValueChange={v => {
                                                    const newItems = [...formData.items];
                                                    newItems[idx].item_code = v;
                                                    setFormData({ ...formData, items: newItems });
                                                }}>
                                                    <SelectTrigger><SelectValue placeholder="Select Item" /></SelectTrigger>
                                                    <SelectContent>
                                                        {items.map(i => <SelectItem key={i.name} value={i.name}>{i.item_name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" value={item.qty} onChange={e => {
                                                    const newItems = [...formData.items];
                                                    newItems[idx].qty = parseFloat(e.target.value);
                                                    setFormData({ ...formData, items: newItems });
                                                }} />
                                            </TableCell>
                                            <TableCell>
                                                <Input type="date" value={item.schedule_date} onChange={e => {
                                                    const newItems = [...formData.items];
                                                    newItems[idx].schedule_date = e.target.value;
                                                    setFormData({ ...formData, items: newItems });
                                                }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Create Request"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
