"use client";

import React, { useEffect, useState } from "react";
import {
    Database, Mail, FileText, Folder, Clock, Settings, ShieldCheck,
    Terminal, Activity, HardDrive, RefreshCw, ChevronLeft, ArrowUpRight
} from "lucide-react";
import { getClientWebsites } from "@/app/actions/handson/control/rpanel/websites/get-client-websites";
// import { RPanelNav } from "@/components/custom/nav/rpanel-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SiteDashboardPage({ params }: { params: { website: string } }) {
    const [website, setWebsite] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchSite() {
            setIsLoading(true);
            const res = await getClientWebsites(params.website); // Assuming this can fetch single or we filter
            if (res.message?.success) {
                // If the API returns a list, find the one matching the param
                // Assuming params.website is the ID (name)
                const site = res.message.websites.find((s: any) => s.name === params.website);
                if (site) {
                    setWebsite(site);
                } else {
                    toast({ title: "Error", description: "Website not found", variant: "destructive" });
                }
            }
            setIsLoading(false);
        }
        fetchSite();
    }, [params.website]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-[#0f1219] text-gray-200 font-sans">
                {/* <RPanelNav /> */}
                <main className="flex-1 p-8 flex items-center justify-center">
                    <div className="text-gray-400">Loading site details...</div>
                </main>
            </div>
        );
    }

    if (!website) {
        return (
            <div className="flex min-h-screen bg-[#0f1219] text-gray-200 font-sans">
                <RPanelNav />
                <main className="flex-1 p-8">
                    <div className="mb-4">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Websites
                        </Button>
                    </div>
                    <div className="text-center text-gray-400 mt-20">
                        <h2 className="text-xl font-semibold mb-2">Website Not Found</h2>
                        <p>The website you are looking for does not exist or you do not have permission to view it.</p>
                    </div>
                </main>
            </div>
        );
    }

    const tools = [
        {
            label: "Scheduler",
            icon: <Clock className="h-6 w-6 text-purple-400" />,
            desc: "Manage cron jobs",
            href: `/rpanel/cron?website=${website.name}`
        },
        {
            label: "Mail",
            icon: <Mail className="h-6 w-6 text-blue-400" />,
            desc: "Email accounts",
            href: `/rpanel/emails?domain=${website.domain}`
        },
        {
            label: "Logs",
            icon: <FileText className="h-6 w-6 text-gray-400" />,
            desc: "Server logs",
            href: `/rpanel/websites/${website.name}/logs`
        },
        {
            label: "Files",
            icon: <Folder className="h-6 w-6 text-yellow-400" />,
            desc: "File manager",
            href: `/rpanel/websites/${website.name}/files`
        },
        {
            label: "Databases",
            icon: <Database className="h-6 w-6 text-green-400" />,
            desc: "Manage databases",
            href: `/rpanel/databases?website=${website.name}`
        },
        {
            label: "FTP Accounts",
            icon: <Folder className="h-6 w-6 text-orange-400" />,
            desc: "FTP access",
            href: `/rpanel/ftp?website=${website.name}`
        },
        {
            label: "Backups",
            icon: <ShieldCheck className="h-6 w-6 text-teal-400" />,
            desc: "Site backups",
            href: `/rpanel/backups?website=${website.name}`
        },
        {
            label: "Settings",
            icon: <Settings className="h-6 w-6 text-gray-300" />,
            desc: "PHP & General",
            action: () => toast({ title: "Info", description: "Settings modal would open here (use 'Edit' on main list for now)" })
        },
        {
            label: "Nginx Config",
            icon: <FileText className="h-6 w-6 text-red-400" />,
            desc: "Manual settings",
            placeholder: true
        },
        {
            label: "Terminal",
            icon: <Terminal className="h-6 w-6 text-green-500" />,
            desc: "Web terminal",
            placeholder: true
        },
        {
            label: "Scanning",
            icon: <Activity className="h-6 w-6 text-red-500" />,
            desc: "Malware scan",
            placeholder: true
        },
        {
            label: "SFTP Accounts",
            icon: <HardDrive className="h-6 w-6 text-blue-300" />,
            desc: "Secure FTP",
            placeholder: true
        }
    ];

    return (
        <div className="flex min-h-screen bg-[#0f1219] text-gray-200 font-sans">
            <RPanelNav />
            <main className="flex-1 p-8">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => router.push('/rpanel/websites')} className="mb-4 pl-0 hover:bg-transparent hover:text-white text-gray-400">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Websites
                    </Button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">{website.domain}</h1>
                            <p className="text-muted-foreground flex items-center gap-2">
                                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs border border-blue-500/20">
                                    {website.php_version ? `PHP ${website.php_version}` : 'Static'}
                                </span>
                                <span className="text-gray-500">•</span>
                                <span>{website.site_type}</span>
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => window.open(`http://${website.domain}`, '_blank')}>
                            Visit Site <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tools.map((tool, idx) => (
                        <Card
                            key={idx}
                            className={`bg-[#1a1f36] border-gray-700 transition-all duration-200 ${tool.placeholder ? 'opacity-70' : 'hover:border-blue-500/50 hover:bg-[#202640] cursor-pointer group'
                                }`}
                            onClick={() => {
                                if (tool.placeholder) {
                                    toast({ title: "Coming Soon", description: "This feature is not yet available." });
                                } else if (tool.action) {
                                    tool.action();
                                } else if (tool.href) {
                                    router.push(tool.href);
                                }
                            }}
                        >
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className={`p-3 rounded-lg bg-[#0f1219] border border-gray-800 ${tool.placeholder ? 'grayscale' : ''}`}>
                                    {tool.icon}
                                </div>
                                <div>
                                    <h3 className={`font-semibold text-lg ${tool.placeholder ? 'text-gray-500' : 'text-gray-200 group-hover:text-white'}`}>
                                        {tool.label}
                                    </h3>
                                    <p className="text-sm text-gray-500">{tool.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
