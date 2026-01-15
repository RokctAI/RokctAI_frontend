"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/custom/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { callPublicApi } from "@/app/services/common/api";

interface LogEntry {
    component: string;
    version: string;
    date: string;
    notes: string;
}

interface StatusData {
    status: string;
    logs: LogEntry[];
}

export default function StatusPage() {
    const [data, setData] = useState<StatusData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await callPublicApi("control.control.api.system.get_system_status");
                if (res && res.status) {
                    setData(res);
                }
            } catch (error) {
                console.error("Failed to fetch status:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStatus();
    }, []);

    const isOperational = data?.status === "Operational";

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <div className="flex flex-col gap-8">

                    {/* Status Banner */}
                    <div className="flex flex-col items-center gap-4 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
                        {loading ? (
                            <Skeleton className="h-12 w-64 rounded-full" />
                        ) : (
                            <div className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-medium border ${isOperational
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"}`}>
                                {isOperational ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
                                {data?.status || "Unknown"}
                            </div>
                        )}
                        <p className="text-muted-foreground max-w-lg">
                            {isOperational
                                ? "All systems are running smoothly. No maintenance is currently scheduled."
                                : "Scheduled maintenance is pending. Updates will be applied automatically on Sunday."}
                        </p>
                    </div>

                    {/* Release Logs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                                Recent Updates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {loading ? (
                                <>
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </>
                            ) : data?.logs && data.logs.length > 0 ? (
                                <div className="relative border-l border-muted pl-6 space-y-8">
                                    {data.logs.map((log, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-semibold text-lg">{log.component}</span>
                                                    <Badge variant="secondary" className="font-mono">{log.version}</Badge>
                                                    <span className="text-xs text-muted-foreground ml-auto">
                                                        {new Date(log.date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                                                    </span>
                                                </div>
                                                <div
                                                    className="prose dark:prose-invert text-sm text-muted-foreground max-w-none bg-muted/50 p-4 rounded-lg"
                                                    dangerouslySetInnerHTML={{ __html: log.notes ? log.notes.replace(/\n/g, "<br/>") : "Maintenance update applied." }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    No recent updates recorded.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    );
}
