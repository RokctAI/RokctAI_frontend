"use client";

import { Loader2, Server, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getSystemInfo } from "@/app/actions/paas/admin/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSystemInfoPage() {
    const [info, setInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">System Information</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">API Status</CardTitle>
                        <CheckCircle2 className="size-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{info?.message || "Online"}</div>
                        <p className="text-xs text-muted-foreground">System is operational</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">App Version</CardTitle>
                        <Server className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{info?.version || "v1.0.0"}</div>
                        <p className="text-xs text-muted-foreground">Current deployment</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
