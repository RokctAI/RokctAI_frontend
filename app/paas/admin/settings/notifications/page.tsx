"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getNotificationSettings } from "@/app/actions/paas/admin/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function NotificationSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const data = await getNotificationSettings();
                setSettings(data);
            } catch (error) {
                console.error("Error fetching notification settings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Notification Settings</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Order Confirmation</Label>
                            <Switch checked={settings.email_order_confirmation} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Order Status Updates</Label>
                            <Switch checked={settings.email_order_status} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>New User Welcome</Label>
                            <Switch checked={settings.email_welcome} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Push Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Order Updates</Label>
                            <Switch checked={settings.push_order_updates} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Promotional Messages</Label>
                            <Switch checked={settings.push_promotions} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
