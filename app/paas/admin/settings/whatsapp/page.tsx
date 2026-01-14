"use client";

import { Loader2, Save, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { getWhatsAppConfig, updateWhatsAppConfig } from "@/app/actions/paas/whatsapp";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function WhatsAppSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        enabled: false,
        phone_number_id: "",
        access_token: "",
        app_secret: "",
        verify_token: "rokct_secure_token" // Default suggestion
    });

    useEffect(() => {
        async function fetchConfig() {
            try {
                const data = await getWhatsAppConfig();
                if (data) {
                    setFormData({
                        enabled: !!data.enabled,
                        phone_number_id: data.phone_number_id || "",
                        access_token: data.access_token || "",
                        app_secret: data.app_secret || "",
                        verify_token: data.verify_token || "rokct_secure_token"
                    });
                }
            } catch (error) {
                console.error("Error fetching config:", error);
                // toast.error("Failed to load WhatsApp settings");
            } finally {
                setLoading(false);
            }
        }
        fetchConfig();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateWhatsAppConfig(formData);
            toast.success("WhatsApp configuration saved");
        } catch (error) {
            console.error("Error updating config:", error);
            toast.error("Failed to save settings");
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
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">WhatsApp Integration</h1>
                    <p className="text-muted-foreground mt-2">Connect your platform to the Meta Cloud API.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="https://developers.facebook.com/apps" target="_blank">
                        <ExternalLink className="mr-2 size-4" />
                        Meta Dashboard
                    </Link>
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                        <CardDescription>Enable or disable the WhatsApp bot globally for this tenant.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Active</Label>
                                <p className="text-sm text-muted-foreground">
                                    When disabled, the bot will not reply to any messages.
                                </p>
                            </div>
                            <Switch
                                checked={formData.enabled}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({ ...prev, enabled: checked }))
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>API Credentials</CardTitle>
                        <CardDescription>
                            Get these from your <a href="https://developers.facebook.com" className="underline text-primary">Meta App Dashboard</a> under WhatsApp &gt; API Setup.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 text-sm text-amber-800 dark:text-amber-200">
                            <strong>Note:</strong> You must create the App in the Meta Dashboard first. This form is only for pasting the keys generated there.
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_number_id">Phone Number ID</Label>
                            <Input
                                id="phone_number_id"
                                name="phone_number_id"
                                value={formData.phone_number_id}
                                onChange={handleChange}
                                placeholder="e.g. 100293485..."
                                required
                            />
                            <p className="text-xs text-muted-foreground">Found in API Setup step.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="access_token">Permanent Access Token</Label>
                            <Input
                                id="access_token"
                                name="access_token"
                                type="password"
                                value={formData.access_token}
                                onChange={handleChange}
                                placeholder="EAA..."
                                required
                            />
                            <p className="text-xs text-muted-foreground">Use a System User Token, not a temporary 24h token.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="app_secret">App Secret (Optional)</Label>
                            <Input
                                id="app_secret"
                                name="app_secret"
                                type="password"
                                value={formData.app_secret}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-muted-foreground">Used to validate incoming webhooks (HMAC).</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Webhook Configuration</CardTitle>
                        <CardDescription>Enter this in your Meta App Dashboard under "Configuration".</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Callback URL</Label>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        disabled
                                        value={`https://${typeof window !== 'undefined' ? window.location.hostname : 'your-site.com'}/api/method/rokct.integrations.whatsapp.webhook`}
                                        className="bg-muted"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="verify_token">Verify Token</Label>
                                <Input
                                    id="verify_token"
                                    name="verify_token"
                                    value={formData.verify_token}
                                    onChange={handleChange}
                                    placeholder="rokct_secure_token"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={saving} size="lg">
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 size-4" />
                                Save Configuration
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
