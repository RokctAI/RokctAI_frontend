"use client";

import { Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getPermissionSettings, updatePermissionSettings } from "@/app/actions/paas/admin/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function PermissionSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({});

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const data = await getPermissionSettings();
            setSettings(data);
        } catch (error) {
            toast.error("Failed to load permission settings");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await updatePermissionSettings(settings);
            toast.success("Permission settings updated successfully");
        } catch (error) {
            toast.error("Failed to update permission settings");
        } finally {
            setSaving(false);
        }
    }

    const handleToggle = (key: string) => {
        setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="size-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Permission Settings</h2>
                    <p className="text-muted-foreground">
                        Manage global system permissions and feature toggles.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {!saving && <Save className="mr-2 size-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Management</CardTitle>
                        <CardDescription>Configure order processing rules.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="auto_approve_orders">Auto Approve All Orders</Label>
                            <Switch
                                id="auto_approve_orders"
                                checked={settings.auto_approve_orders}
                                onCheckedChange={() => handleToggle("auto_approve_orders")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="auto_approve_parcel_orders">Auto Approve Parcel Orders</Label>
                            <Switch
                                id="auto_approve_parcel_orders"
                                checked={settings.auto_approve_parcel_orders}
                                onCheckedChange={() => handleToggle("auto_approve_parcel_orders")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="require_phone_for_order">Require Phone Number for Order</Label>
                            <Switch
                                id="require_phone_for_order"
                                checked={settings.require_phone_for_order}
                                onCheckedChange={() => handleToggle("require_phone_for_order")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable_group_orders">Enable Group Orders</Label>
                            <Switch
                                id="enable_group_orders"
                                checked={settings.enable_group_orders}
                                onCheckedChange={() => handleToggle("enable_group_orders")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable_auto_print_order">Enable Auto-Print Order</Label>
                            <Switch
                                id="enable_auto_print_order"
                                checked={settings.enable_auto_print_order}
                                onCheckedChange={() => handleToggle("enable_auto_print_order")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Refund System</CardTitle>
                        <CardDescription>Manage refund capabilities.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable_refund_system">Enable Refund System</Label>
                            <Switch
                                id="enable_refund_system"
                                checked={settings.enable_refund_system}
                                onCheckedChange={() => handleToggle("enable_refund_system")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable_refund_deletion">Enable Refund Deletion</Label>
                            <Switch
                                id="enable_refund_deletion"
                                checked={settings.enable_refund_deletion}
                                onCheckedChange={() => handleToggle("enable_refund_deletion")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Delivery & Logistics</CardTitle>
                        <CardDescription>Configure delivery settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable_parcel_system">Enable Parcel System</Label>
                            <Switch
                                id="enable_parcel_system"
                                checked={settings.enable_parcel_system}
                                onCheckedChange={() => handleToggle("enable_parcel_system")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable_auto_assign_deliveryman">Enable Auto-Assign Deliveryman</Label>
                            <Switch
                                id="enable_auto_assign_deliveryman"
                                checked={settings.enable_auto_assign_deliveryman}
                                onCheckedChange={() => handleToggle("enable_auto_assign_deliveryman")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable_driver_to_edit_credentials">Enable Driver to Edit Credentials</Label>
                            <Switch
                                id="enable_driver_to_edit_credentials"
                                checked={settings.enable_driver_to_edit_credentials}
                                onCheckedChange={() => handleToggle("enable_driver_to_edit_credentials")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Vendor & Products</CardTitle>
                        <CardDescription>Manage vendor permissions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="auto_approve_products">Auto Approve Products</Label>
                            <Switch
                                id="auto_approve_products"
                                checked={settings.auto_approve_products}
                                onCheckedChange={() => handleToggle("auto_approve_products")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="auto_approve_categories">Auto Approve Categories</Label>
                            <Switch
                                id="auto_approve_categories"
                                checked={settings.auto_approve_categories}
                                onCheckedChange={() => handleToggle("auto_approve_categories")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable_vendor_subscriptions">Enable Vendor Subscriptions</Label>
                            <Switch
                                id="enable_vendor_subscriptions"
                                checked={settings.enable_vendor_subscriptions}
                                onCheckedChange={() => handleToggle("enable_vendor_subscriptions")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable_commission_model">Enable Commission Model</Label>
                            <Switch
                                id="enable_commission_model"
                                checked={settings.enable_commission_model}
                                onCheckedChange={() => handleToggle("enable_commission_model")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Features & Modules</CardTitle>
                        <CardDescription>Toggle major system modules.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2 border-l-4 border-primary pl-4 bg-muted/50 p-2 rounded-r-md">
                            <div className="space-y-0.5">
                                <Label htmlFor="enable_paas_lending" className="font-bold">Enable PaaS Lending</Label>
                                <p className="text-xs text-muted-foreground">Activates the lending and loan management module.</p>
                            </div>
                            <Switch
                                id="enable_paas_lending"
                                checked={settings.enable_paas_lending}
                                onCheckedChange={() => handleToggle("enable_paas_lending")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable_reservations">Enable Reservation System</Label>
                            <Switch
                                id="enable_reservations"
                                checked={settings.enable_reservations}
                                onCheckedChange={() => handleToggle("enable_reservations")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="enable_referral_earnings">Enable Referral Earnings</Label>
                            <Switch
                                id="enable_referral_earnings"
                                checked={settings.enable_referral_earnings}
                                onCheckedChange={() => handleToggle("enable_referral_earnings")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="blog_active">Blog Active</Label>
                            <Switch
                                id="blog_active"
                                checked={settings.blog_active}
                                onCheckedChange={() => handleToggle("blog_active")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System & Misc</CardTitle>
                        <CardDescription>Other system settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="prompt_email_modal">Prompt Email Modal</Label>
                            <Switch
                                id="prompt_email_modal"
                                checked={settings.prompt_email_modal}
                                onCheckedChange={() => handleToggle("prompt_email_modal")}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="aws_active">AWS Active</Label>
                            <Switch
                                id="aws_active"
                                checked={settings.aws_active}
                                onCheckedChange={() => handleToggle("aws_active")}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
