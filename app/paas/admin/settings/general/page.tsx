"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getGeneralSettings, updateGeneralSettings } from "@/app/actions/paas/admin/settings";
import { getGlobalSettings } from "@/app/actions/handson/control/system/global-settings";
import { BetaToggle } from "@/components/custom/beta-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getShops } from "@/app/actions/paas/shop";

export default function GeneralSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [shops, setShops] = useState<any[]>([]);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const [data, globalData, shopList] = await Promise.all([
                    getGeneralSettings(),
                    getGlobalSettings(),
                    getShops()
                ]);
                setSettings({ ...data, isBetaMode: globalData?.isBetaMode });
                setShops(shopList || []);
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    async function handleSave() {
        setSaving(true);
        try {
            await updateGeneralSettings(settings);
            toast.success("Settings saved successfully");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">General Settings</h1>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Business Name</Label>
                            <Input
                                value={settings.business_name || ""}
                                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={settings.phone || ""}
                                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={settings.email || ""}
                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input
                                value={settings.address || ""}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Regional Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <Input
                                value={settings.country || ""}
                                onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Input
                                value={settings.timezone || ""}
                                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Currency Symbol</Label>
                            <Input
                                value={settings.currency_symbol || ""}
                                onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <BetaToggle initialState={settings.isBetaMode || false} />
                            <p className="text-sm text-muted-foreground">
                                Enable global Beta mode to show "Beta" label in the dashboard.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Marketplace Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Multi-Vendor Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Allow multiple shops/vendors on the platform.
                                </p>
                            </div>
                            <Switch
                                checked={!!settings.enable_marketplace}
                                onCheckedChange={(checked) =>
                                    setSettings({ ...settings, enable_marketplace: checked ? 1 : 0 })
                                }
                            />
                        </div>

                        {!settings.enable_marketplace && (
                            <div className="space-y-2 border-t pt-4">
                                <Label>Default Shop</Label>
                                <Select
                                    value={settings.default_shop || ""}
                                    onValueChange={(val) => setSettings({ ...settings, default_shop: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select the main shop" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shops.map((shop) => (
                                            <SelectItem key={shop.name} value={shop.name}>
                                                {shop.shop_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    This shop will be used as the Homepage when Multi-Vendor is disabled.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
