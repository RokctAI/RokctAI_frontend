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
import { getServiceLevelAgreements, createServiceLevelAgreement } from "@/app/actions/handson/all/crm/support/sla";
import { getWarrantyClaims, createWarrantyClaim } from "@/app/actions/handson/all/crm/support/warranty";
import { getCustomers } from "@/app/actions/handson/all/accounting/selling/sales_order";
import { getItems } from "@/app/actions/handson/all/accounting/inventory/item";

// --- SLA ---

export function ServiceLevelAgreementList() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => { getServiceLevelAgreements().then(d => { setList(d); setLoading(false); }); }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Service Level Agreements</h2><Button onClick={() => router.push("/handson/all/commercial/support/sla/new")}><Plus className="h-4 w-4 mr-2" /> New SLA</Button></div>
            <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Service Level</TableHead><TableHead>Priority</TableHead></TableRow></TableHeader><TableBody>{list.map(l => <TableRow key={l.name}><TableCell className="font-medium">{l.name}</TableCell><TableCell>{l.service_level}</TableCell><TableCell>{l.default_priority}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        </div>
    );
}

export function ServiceLevelAgreementForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ service_level: "", enabled: 1, default_priority: "Medium" });

    const handleSubmit = async () => {
        setLoading(true);
        const res = await createServiceLevelAgreement(formData);
        if (res.success) { toast.success("SLA Created"); router.push("/handson/all/commercial/support/sla"); }
        else toast.error("Failed: " + res.error);
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
            <Card><CardHeader><CardTitle>New SLA</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Service Level Name</Label><Input value={formData.service_level} onChange={e => setFormData({ ...formData, service_level: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Default Priority</Label><Select value={formData.default_priority} onValueChange={v => setFormData({ ...formData, default_priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select></div>
                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>Submit</Button>
                </CardContent>
            </Card>
        </div>
    );
}

// --- WARRANTY CLAIM ---

export function WarrantyClaimList() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => { getWarrantyClaims().then(d => { setList(d); setLoading(false); }); }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Warranty Claims</h2><Button onClick={() => router.push("/handson/all/commercial/support/warranty/new")}><Plus className="h-4 w-4 mr-2" /> New Claim</Button></div>
            <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Customer</TableHead><TableHead>Item</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{list.map(l => <TableRow key={l.name}><TableCell className="font-medium">{l.name}</TableCell><TableCell>{l.customer}</TableCell><TableCell>{l.item_code}</TableCell><TableCell>{l.status}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        </div>
    );
}

export function WarrantyClaimForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [formData, setFormData] = useState({ customer: "", item_code: "", issue_date: new Date().toISOString().split('T')[0], description: "" });

    useEffect(() => {
        getCustomers().then(c => setCustomers(c || []));
        getItems().then(setItems);
    }, []);

    const handleSubmit = async () => {
        setLoading(true);
        const res = await createWarrantyClaim(formData);
        if (res.success) { toast.success("Claim Created"); router.push("/handson/all/commercial/support/warranty"); }
        else toast.error("Failed: " + res.error);
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
            <Card><CardHeader><CardTitle>New Warranty Claim</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Customer</Label><Select value={formData.customer} onValueChange={v => setFormData({ ...formData, customer: v })}><SelectTrigger><SelectValue placeholder="Select Customer" /></SelectTrigger><SelectContent>{customers.map(c => <SelectItem key={c.name} value={c.name}>{c.customer_name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Item</Label><Select value={formData.item_code} onValueChange={v => setFormData({ ...formData, item_code: v })}><SelectTrigger><SelectValue placeholder="Select Item" /></SelectTrigger><SelectContent>{items.map(i => <SelectItem key={i.item_code} value={i.item_code}>{i.item_name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Issue Date</Label><Input type="date" value={formData.issue_date} onChange={e => setFormData({ ...formData, issue_date: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Description</Label><Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>Submit</Button>
                </CardContent>
            </Card>
        </div>
    );
}
