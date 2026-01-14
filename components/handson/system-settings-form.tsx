"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getSystemSettings, updateSystemSettings } from "@/app/actions/handson/all/settings/general";

export function SystemSettingsForm() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSystemSettings().then(res => {
            if (res) setSettings(res);
        });
    }, []);

    const handleSave = async () => {
        setLoading(true);
        const res = await updateSystemSettings(settings);
        if (res.success) toast.success("System Settings Updated");
        else toast.error("Failed to update settings");
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Global system configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Country</Label>
                        <Input value={settings.country || ""} onChange={e => setSettings({ ...settings, country: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Time Zone</Label>
                        <Input value={settings.time_zone || ""} onChange={e => setSettings({ ...settings, time_zone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Language</Label>
                        <Input value={settings.language || ""} onChange={e => setSettings({ ...settings, language: e.target.value })} />
                    </div>
                </div>
                <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Settings"}</Button>
            </CardContent>
        </Card>
    );
}
