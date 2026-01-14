"use client";

import React, { useEffect, useState } from "react";
import {
    FileText, RefreshCw, Trash2, Home, ChevronRight, Activity, AlertCircle, FileCode, Server
} from "lucide-react";
import { getControlClient } from "@/app/lib/client";
// import { RPanelNav } from "@/components/custom/nav/rpanel-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { getLogStats, getLogContent, clearLog } from "@/app/actions/handson/control/rpanel/logs/view-logs";

export default function LogsPage({ params }: { params: { website: string } }) {
    const [stats, setStats] = useState<any>(null);
    const [currentLog, setCurrentLog] = useState<string>("nginx_error");
    const [logContent, setLogContent] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        loadLogContent(currentLog);
    }, [currentLog]);

    async function loadStats() {
        setIsLoading(true);
        const res = await getLogStats(params.website);
        if (res?.success) {
            setStats(res.stats);
        }
        setIsLoading(false);
    }

    async function loadLogContent(logType: string) {
        setIsLoadingContent(true);
        const res = await getLogContent(params.website, logType);
        if (res?.success) {
            setLogContent(res.lines || []);
        } else {
            setLogContent(["Error loading logs or log file empty."]);
        }
        setIsLoadingContent(false);
    }

    async function handleClearLog() {
        if (!confirm("Are you sure you want to clear this log?")) return;
        const res = await clearLog(params.website, currentLog);
        if (res?.success) {
            toast({ title: "Success", description: "Log cleared" });
            loadLogContent(currentLog);
            loadStats();
        } else {
            toast({ title: "Error", description: res?.error, variant: "destructive" });
        }
    }

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'nginx_access': return <Activity className="h-4 w-4" />;
            case 'nginx_error': return <AlertCircle className="h-4 w-4" />;
            case 'php_error': return <FileCode className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    }

    const getLogLabel = (type: string) => {
        switch (type) {
            case 'nginx_access': return 'Nginx Access';
            case 'nginx_error': return 'Nginx Error';
            case 'php_error': return 'PHP Error';
            case 'application': return 'Application Debug';
            default: return type;
        }
    }

    return (
        <div className="flex min-h-screen bg-[#0f1219] text-gray-200 font-sans">
            {/* <RPanelNav /> */}
            <main className="flex-1 p-8 h-screen flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Log Viewer</h1>
                        <p className="text-muted-foreground">Server logs for {params.website}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { loadStats(); loadLogContent(currentLog); }}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                        </Button>
                        <Button variant="destructive" onClick={handleClearLog}>
                            <Trash2 className="mr-2 h-4 w-4" /> Clear Log
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
                    {stats && Object.entries(stats).map(([key, val]: [string, any]) => (
                        <Card key={key}
                            className={`bg-[#1a1f36] border-gray-700 cursor-pointer transition-colors ${currentLog === key ? 'border-blue-500 ring-1 ring-blue-500' : 'hover:border-gray-500'}`}
                            onClick={() => setCurrentLog(key)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-200">
                                    {getLogLabel(key)}
                                </CardTitle>
                                {getLogIcon(key)}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{val.exists ? `${val.size_mb} MB` : 'N/A'}</div>
                                <p className="text-xs text-muted-foreground">
                                    {val.exists ? `${val.line_count} lines` : 'File not found'}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Log Content Area */}
                <Card className="flex-1 bg-[#1a1f36] border-gray-700 flex flex-col overflow-hidden min-h-0">
                    <CardHeader className="border-b border-gray-700 py-3 shrink-0">
                        <CardTitle className="text-sm font-mono flex items-center gap-2">
                            <Server className="h-4 w-4" />
                            /var/log/.../{currentLog}.log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 relative bg-black/50 font-mono text-xs overflow-auto">
                        {isLoadingContent ? (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                Loading logs...
                            </div>
                        ) : (
                            <div className="p-4 space-y-1">
                                {logContent.map((line, i) => (
                                    <div key={i} className="whitespace-pre-wrap break-all hover:bg-white/5 px-1 rounded text-gray-300">
                                        <span className="text-gray-600 select-none w-8 inline-block text-right mr-4">{i + 1}</span>
                                        {line}
                                    </div>
                                ))}
                                {logContent.length === 0 && (
                                    <div className="text-gray-500 italic">No log entries found.</div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
