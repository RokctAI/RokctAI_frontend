"use client";

import { Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getDeliverySettings, updateDeliverySettings } from "@/app/actions/paas/admin/logistics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function DeliverymanSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const data = await getDeliverySettings();
            if (data) {
                setFormData(data);
            }
        } catch (error) {
            toast.error("Failed to load delivery settings");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        try {
            await updateDeliverySettings(formData);
            toast.success("Delivery settings updated");
        } catch (error) {
            toast.error("Failed to update delivery settings");
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
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Deliveryman Settings</h2>
                <p className="text-muted-foreground">
                    Configure global settings for delivery operations.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Configuration</CardTitle>
                    <CardDescription>
                        Set default values and rules for deliverymen.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Search Radius (km)</Label>
                            <Input
                                type="number"
                                value={formData.search_radius || ""}
                                onChange={(e) => setFormData({ ...formData, search_radius: parseFloat(e.target.value) })}
                                placeholder="e.g., 10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Orders per Driver</Label>
                            <Input
                                type="number"
                                value={formData.max_orders || ""}
                                onChange={(e) => setFormData({ ...formData, max_orders: parseInt(e.target.value) })}
                                placeholder="e.g., 5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Base Delivery Fee</Label>
                            <Input
                                type="number"
                                value={formData.base_fee || ""}
                                onChange={(e) => setFormData({ ...formData, base_fee: parseFloat(e.target.value) })}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Fee per km</Label>
                            <Input
                                type="number"
                                value={formData.fee_per_km || ""}
                                onChange={(e) => setFormData({ ...formData, fee_per_km: parseFloat(e.target.value) })}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-4">
                        <Switch
                            checked={!!formData.auto_assign}
                            onCheckedChange={(checked) => setFormData({ ...formData, auto_assign: checked ? 1 : 0 })}
                        />
                        <Label>Auto-assign Orders</Label>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave}>
                    <Save className="mr-2 size-4" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
