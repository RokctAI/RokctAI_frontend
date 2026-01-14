"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { getAppSettings } from "@/app/actions/paas/admin/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AppSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const data = await getAppSettings();
                setSettings(data);
            } catch (error) {
                console.error("Error fetching app settings:", error);
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
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">App Settings</h1>
                <Button>
                    <Save className="mr-2 size-4" />
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Mobile App Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Android App URL (Play Store)</Label>
                            <Input defaultValue={settings.android_app_url} />
                        </div>
                        <div className="space-y-2">
                            <Label>iOS App URL (App Store)</Label>
                            <Input defaultValue={settings.ios_app_url} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>App Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Minimum Android Version</Label>
                            <Input defaultValue={settings.min_android_version} />
                        </div>
                        <div className="space-y-2">
                            <Label>Minimum iOS Version</Label>
                            <Input defaultValue={settings.min_ios_version} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
