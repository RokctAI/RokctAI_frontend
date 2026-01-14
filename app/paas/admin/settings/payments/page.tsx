"use client";

import { Loader2, Settings2, Plus, Trash2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getPaymentMethods, updatePaymentMethod, getPaymentGateway, savePaymentGateway } from "@/app/actions/paas/admin/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PaymentMethodsPage() {
    const [methods, setMethods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [editingGateway, setEditingGateway] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loadingGateway, setLoadingGateway] = useState(false);
    const [savingGateway, setSavingGateway] = useState(false);

    useEffect(() => {
        fetchMethods();
    }, []);

    async function fetchMethods() {
        try {
            const data = await getPaymentMethods();
            setMethods(data);
        } catch (error) {
            console.error("Error fetching payment methods:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleToggle = async (methodName: string, currentStatus: boolean) => {
        // Optimistic Update
        setMethods(prev => prev.map(m =>
            m.name === methodName ? { ...m, active: !currentStatus } : m
        ));

        try {
            await updatePaymentMethod(methodName, !currentStatus);
            toast.success("Payment method updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update payment method");
            // Revert
            setMethods(prev => prev.map(m =>
                m.name === methodName ? { ...m, active: currentStatus } : m
            ));
        }
    };

    const handleManage = async (methodName: string) => {
        setLoadingGateway(true);
        setIsDialogOpen(true);
        try {
            const gateway = await getPaymentGateway(methodName);
            // Ensure settings table exists
            if (!gateway.settings) gateway.settings = [];
            setEditingGateway(gateway);
        } catch (error) {
            toast.error("Failed to load gateway details");
            setIsDialogOpen(false);
        } finally {
            setLoadingGateway(false);
        }
    };

    const handleSaveGateway = async () => {
        setSavingGateway(true);
        try {
            await savePaymentGateway(editingGateway);
            toast.success("Gateway configuration saved");
            setIsDialogOpen(false);
            fetchMethods(); // Refresh active status
        } catch (error) {
            console.error(error);
            toast.error("Failed to save configuration");
        } finally {
            setSavingGateway(false);
        }
    };

    // Helper to update settings list
    const updateSetting = (index: number, field: 'key' | 'value', val: string) => {
        const newSettings = [...editingGateway.settings];
        newSettings[index] = { ...newSettings[index], [field]: val };
        setEditingGateway({ ...editingGateway, settings: newSettings });
    };

    const addSetting = () => {
        setEditingGateway({
            ...editingGateway,
            settings: [...editingGateway.settings, { doctype: "PaaS Payment Gateway Setting", key: "", value: "" }]
        });
    };

    const removeSetting = (index: number) => {
        const newSettings = [...editingGateway.settings];
        newSettings.splice(index, 1);
        setEditingGateway({ ...editingGateway, settings: newSettings });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Payment Methods</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {methods.map((method) => (
                    <Card key={method.name}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">
                                {method.method_name}
                            </CardTitle>
                            <Switch
                                checked={!!method.active}
                                onCheckedChange={() => handleToggle(method.name, !!method.active)}
                            />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground min-h-[40px]">
                                {method.description || "No description available."}
                            </p>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => handleManage(method.name)}>
                                <Settings2 className="mr-2 size-4" />
                                Manage Configuration
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Manage Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Configure Payment Gateway</DialogTitle>
                        <DialogDescription>
                            Set the API Credentials and Sandbox mode for this gateway.
                        </DialogDescription>
                    </DialogHeader>

                    {loadingGateway || !editingGateway ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="size-8 animate-spin text-gray-500" />
                        </div>
                    ) : (
                        <div className="space-y-6 py-4">
                            {/* General Toggles */}
                            <div className="flex items-center justify-between border p-4 rounded-lg">
                                <Label>Enabled</Label>
                                <Switch
                                    checked={!!editingGateway.enabled}
                                    onCheckedChange={(c) => setEditingGateway({ ...editingGateway, enabled: c ? 1 : 0 })}
                                />
                            </div>

                            <div className="flex items-center justify-between border p-4 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label>Sandbox Mode</Label>
                                    <p className="text-xs text-muted-foreground">Enable valid test credentials.</p>
                                </div>
                                <Switch
                                    checked={!!editingGateway.is_sandbox}
                                    onCheckedChange={(c) => setEditingGateway({ ...editingGateway, is_sandbox: c ? 1 : 0 })}
                                />
                            </div>

                            {/* Dynamic Settings Table */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base">Payload / Secrets</Label>
                                    <Button variant="ghost" size="sm" onClick={addSetting}>
                                        <Plus className="mr-2 size-4" /> Add Key
                                    </Button>
                                </div>

                                {editingGateway.settings?.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic">No configuration keys added yet.</p>
                                )}

                                <div className="space-y-3">
                                    {editingGateway.settings?.map((setting: any, index: number) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <Input
                                                placeholder="Key (e.g. api_key)"
                                                value={setting.key}
                                                onChange={(e) => updateSetting(index, 'key', e.target.value)}
                                                className="flex-1"
                                            />
                                            <Input
                                                placeholder="Value"
                                                value={setting.value}
                                                onChange={(e) => updateSetting(index, 'value', e.target.value)}
                                                className="flex-1"
                                                type="password" // Mask values for safety? Or text? Usually text for editing but safer password. toggle? Simple Text for now.
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => removeSetting(index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={savingGateway}>Cancel</Button>
                        <Button onClick={handleSaveGateway} disabled={savingGateway || loadingGateway}>
                            {savingGateway && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Save Configuration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
