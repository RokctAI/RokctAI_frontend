"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function CrmSettingsPage() {

    // Placeholder save
    const handleSave = () => {
        toast.success("Settings saved successfully");
    };

    return (
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM Settings</h1>
                    <p className="text-muted-foreground">Manage your CRM preferences and default configurations.</p>
                </div>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>General</CardTitle>
                        <CardDescription>Basic configuration for your CRM workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Enable Desktop Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive browser notifications for new leads and tasks.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Dark Mode Default</Label>
                                <p className="text-sm text-muted-foreground">Force dark mode for all CRM pages.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                {/* Pipeline Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pipeline Defaults</CardTitle>
                        <CardDescription>Set default stages and probabilities for new opportunities.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Auto-create Task on New Deal</Label>
                                <p className="text-sm text-muted-foreground">Automatically create a follow-up task when a new deal is added.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
