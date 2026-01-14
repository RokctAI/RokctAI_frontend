"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Added Import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation"; // Added Import
import { createAssetMaintenance } from "@/app/actions/handson/all/accounting/assets/maintenance/createAssetMaintenance";
import { toast } from "sonner"; // Added Import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added Import
import { Label } from "@/components/ui/label"; // Added Import

export function AssetMaintenanceList({ items }: { items: any[] }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold">Asset Maintenance</h1><p className="text-muted-foreground">Scheduled repairs.</p></div>
                <Link href="/handson/all/financials/assets/maintenance/new"><Button><Plus className="mr-2 h-4 w-4" /> Schedule Maintenance</Button></Link>
            </div>
            <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Asset</TableHead><TableHead>Team</TableHead></TableRow></TableHeader>
                <TableBody>{items.map(o => <TableRow key={o.name}><TableCell>{o.name}</TableCell><TableCell>{o.asset_name}</TableCell><TableCell>{o.maintenance_team}</TableCell></TableRow>)}</TableBody>
            </Table>
        </div>
    );
}

export function AssetMaintenanceForm() {
    const router = useRouter();
    const [asset, setAsset] = useState("");
    const [team, setTeam] = useState("");

    const handleSubmit = async () => {
        const res = await createAssetMaintenance({
            asset_name: asset, company: "Juvo", maintenance_team: team,
            maintenance_tasks: [{ maintenance_task: "Repair" }]
        });
        if (res.success) { toast.success("Maintenance Scheduled"); router.push("/handson/all/financials/assets/maintenance"); }
        else toast.error(res.error);
    };

    return (
        <div className="max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Maintenance Schedule</h1>
            <Card>
                <CardContent className="space-y-4 pt-4">
                    <div><Label>Asset Name</Label><Input value={asset} onChange={e => setAsset(e.target.value)} /></div>
                    <div><Label>Team (User)</Label><Input value={team} onChange={e => setTeam(e.target.value)} /></div>
                    <Button onClick={handleSubmit}>Save Schedule</Button>
                </CardContent>
            </Card>
        </div>
    );
}
