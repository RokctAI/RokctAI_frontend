'use client';

import React, { useEffect, useState } from "react";
import { Server, Monitor, Cpu, Clock, HardDrive, Globe, Database } from "lucide-react";
import { getClientUsage } from "@/app/actions/handson/control/rpanel/dashboard/get-client-usage";

interface ServerInfo {
    ip: string;
    os: string;
    cores: number;
    uptime: string;
}

interface ServerInfoHeaderProps {
    info: ServerInfo | null;
    loading: boolean;
}

interface ClientUsage {
    websites: { used: number, limit: number };
    databases: { used: number, limit: number };
    storage_gb: { used: number, limit: number };
}

export function ServerInfoHeader({ info, loading: serverLoading }: ServerInfoHeaderProps) {
    const [clientUsage, setClientUsage] = useState<ClientUsage | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsage() {
            try {
                const response = await getClientUsage();
                if (response?.message?.success && response.message.usage) {
                    setClientUsage(response.message.usage);
                    setIsClient(true);
                } else if (response?.success && response.usage) {
                    // Handle case where message wrapper might not be present or different structure
                    setClientUsage(response.usage);
                    setIsClient(true);
                } else {
                    // If fetching usage fails or returns no usage, assume admin or guest
                    setIsClient(false);
                }
            } catch (error) {
                console.error("Failed to fetch client usage", error);
                setIsClient(false);
            } finally {
                setLoading(false);
            }
        }
        fetchUsage();
    }, []);

    const isLoading = loading || serverLoading;

    if (isLoading) {
        return (
            <div className="bg-[#1a1f36] text-white p-6 rounded-lg mb-6 shadow-lg animate-pulse">
                <div className="h-8 w-1/3 bg-gray-700 rounded mb-4"></div>
                <div className="flex gap-6">
                    <div className="h-4 w-20 bg-gray-700 rounded"></div>
                    <div className="h-4 w-20 bg-gray-700 rounded"></div>
                    <div className="h-4 w-20 bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    // Client View: Show Quotas
    if (isClient && clientUsage) {
        return (
            <div className="bg-[#1a1f36] text-white p-6 rounded-lg mb-6 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none"></div>

                <div className="relative z-10">
                    <h1 className="text-2xl font-bold mb-4">Resource Usage</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 p-4 rounded-lg flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-full">
                                <Globe className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Websites</p>
                                <p className="text-xl font-semibold">
                                    {clientUsage.websites.used} <span className="text-sm text-gray-500">/ {clientUsage.websites.limit}</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/10 p-4 rounded-lg flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-full">
                                <Database className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Databases</p>
                                <p className="text-xl font-semibold">
                                    {clientUsage.databases.used} <span className="text-sm text-gray-500">/ {clientUsage.databases.limit}</span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/10 p-4 rounded-lg flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-full">
                                <HardDrive className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Storage (GB)</p>
                                <p className="text-xl font-semibold">
                                    {clientUsage.storage_gb.used} <span className="text-sm text-gray-500">/ {clientUsage.storage_gb.limit}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Admin View: Show Server Stats (Default fallback if info exists)
    if (info) {
        return (
            <div className="bg-[#1a1f36] text-white p-6 rounded-lg mb-6 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none"></div>

                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
                            {info.ip} <span className="text-gray-400 text-sm font-normal">(Primary)</span>
                        </h1>

                        <div className="flex flex-wrap gap-6 text-sm text-gray-300">
                            <div className="flex items-center gap-2">
                                <Server className="h-4 w-4" />
                                <span>{info.ip}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                <span>OS: {info.os}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Cpu className="h-4 w-4" />
                                <span>Cores: {info.cores}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Uptime: {info.uptime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
