"use client";
import { useState } from "react";
import Link from "next/link"; // Added
import { Plus } from "lucide-react"; // Added
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { createActivityType } from "@/app/actions/handson/all/projects/timesheets";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function ActivityTypeList({ items }: { items: any[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Activity Types</h1><p className="text-muted-foreground">Billable work types.</p></div>
                <Link href="/handson/all/work_management/projects/activity-type/new"><Button><Plus className="mr-2 h-4 w-4" /> New Type</Button></Link>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader><TableRow><TableHead>Activity Type</TableHead><TableHead>Default Rate</TableHead></TableRow></TableHeader>
                    <TableBody>{items.map(t => <TableRow key={t.name}><TableCell>{t.activity_type}</TableCell><TableCell>{t.costing_rate}</TableCell></TableRow>)}</TableBody>
                </Table>
            </div>
        </div>
    );
}

export function ActivityTypeForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [rate, setRate] = useState(0);

    const handleSubmit = async () => {
        const res = await createActivityType({ activity_type: name, costing_rate: rate });
        if (res.success) { toast.success("Created"); router.push("/handson/all/work_management/projects/activity-type"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold">New Activity Type</h1>
            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                    <div><Label>Rate</Label><Input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} /></div>
                    <Button onClick={handleSubmit}>Save</Button>
                </CardContent>
            </Card>
        </div>
    );
}
