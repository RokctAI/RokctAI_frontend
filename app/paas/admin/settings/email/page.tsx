"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { getEmailSettings } from "@/app/actions/paas/admin/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmailSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const data = await getEmailSettings();
                setSettings(data);
            } catch (error) {
                console.error("Error fetching email settings:", error);
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
                <h1 className="text-3xl font-bold">Email Provider Settings</h1>
                <Button>
                    <Save className="mr-2 size-4" />
                    Save Changes
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>SMTP Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>SMTP Host</Label>
                            <Input defaultValue={settings.smtp_host} />
                        </div>
                        <div className="space-y-2">
                            <Label>SMTP Port</Label>
                            <Input defaultValue={settings.smtp_port} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input defaultValue={settings.smtp_username} />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input type="password" defaultValue={settings.smtp_password} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>From Email</Label>
                        <Input defaultValue={settings.from_email} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
