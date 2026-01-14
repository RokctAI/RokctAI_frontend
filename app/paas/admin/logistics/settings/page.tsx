"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getDeliverySettings, updateDeliverySettings } from "@/app/actions/paas/admin/logistics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminDeliverySettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const data = await getDeliverySettings();
                setSettings(data || {});
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateDeliverySettings(settings);
            toast.success("Settings updated successfully");
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold">Delivery Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Global Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="search_radius">Search Radius (km)</Label>
                        <Input
                            id="search_radius"
                            type="number"
                            value={settings.search_radius || ""}
                            onChange={(e) => setSettings({ ...settings, search_radius: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="max_orders">Max Orders per Delivery Man</Label>
                        <Input
                            id="max_orders"
                            type="number"
                            value={settings.max_orders || ""}
                            onChange={(e) => setSettings({ ...settings, max_orders: parseInt(e.target.value) })}
                        />
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="w-full">
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 size-4" />
                                Save Settings
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
