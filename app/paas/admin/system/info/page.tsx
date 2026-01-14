"use client";

import { Loader2, Trash2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getSystemInfo, clearCache } from "@/app/actions/paas/admin/system";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemInfoPage() {
    const [info, setInfo] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        async function fetchInfo() {
            try {
                const data = await getSystemInfo();
                setInfo(data);
            } catch (error) {
                console.error("Error fetching system info:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchInfo();
    }, []);

    async function handleClearCache() {
        setClearing(true);
        try {
            await clearCache();
            toast.success("System cache cleared successfully");
        } catch (error) {
            toast.error("Failed to clear cache");
        } finally {
            setClearing(false);
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
                <h1 className="text-3xl font-bold">System Information</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <RefreshCw className="mr-2 size-4" />
                        Refresh
                    </Button>
                    <Button variant="destructive" onClick={handleClearCache} disabled={clearing}>
                        {clearing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}
                        Clear Cache
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Application Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">App Name</span>
                            <span className="font-medium">{info.app_name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Version</span>
                            <span className="font-medium">{info.version}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Framework</span>
                            <span className="font-medium">{info.framework_version}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Server Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Python Version</span>
                            <span className="font-medium">{info.python_version}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Database</span>
                            <span className="font-medium">{info.database}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">OS</span>
                            <span className="font-medium">{info.os}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
