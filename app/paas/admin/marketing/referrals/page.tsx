"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getReferrals, createReferral, deleteReferral } from "@/app/actions/paas/admin/marketing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function ReferralsPage() {
    const [loading, setLoading] = useState(true);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        referrer: "",
        referred_user: "",
        referral_code: ""
    });

    useEffect(() => {
        loadReferrals();
    }, []);

    async function loadReferrals() {
        try {
            const data = await getReferrals();
            setReferrals(data);
        } catch (error) {
            toast.error("Failed to load referrals");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        try {
            await createReferral(formData);
            toast.success("Referral created");
            setIsDialogOpen(false);
            setFormData({ referrer: "", referred_user: "", referral_code: "" });
            loadReferrals();
        } catch (error) {
            toast.error("Failed to create referral");
        }
    }

    async function handleDelete(name: string) {
        if (!confirm("Are you sure you want to delete this referral?")) return;
        try {
            await deleteReferral(name);
            toast.success("Referral deleted");
            loadReferrals();
        } catch (error) {
            toast.error("Failed to delete referral");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="size-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Referrals</h2>
                    <p className="text-muted-foreground">
                        Manage user referrals and codes.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Add Referral
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Referral</DialogTitle>
                            <DialogDescription>
                                Manually add a referral record.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Referrer (User Email)</Label>
                                <Input
                                    value={formData.referrer}
                                    onChange={(e) => setFormData({ ...formData, referrer: e.target.value })}
                                    placeholder="referrer@example.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Referred User (User Email)</Label>
                                <Input
                                    value={formData.referred_user}
                                    onChange={(e) => setFormData({ ...formData, referred_user: e.target.value })}
                                    placeholder="newuser@example.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Referral Code</Label>
                                <Input
                                    value={formData.referral_code}
                                    onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                                    placeholder="CODE123"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Create Referral</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Referrals</CardTitle>
                    <CardDescription>
                        List of all referrals in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Referrer</TableHead>
                                <TableHead>Referred User</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {referrals.map((referral) => (
                                <TableRow key={referral.name}>
                                    <TableCell>{referral.referrer}</TableCell>
                                    <TableCell>{referral.referred_user}</TableCell>
                                    <TableCell>{referral.referral_code}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(referral.name)}
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {referrals.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No referrals found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
