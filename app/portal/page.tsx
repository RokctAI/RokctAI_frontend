"use client";

import React, { useEffect, useState } from "react";
import { getClientSubscriptions } from "../actions/portal/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, Server, Wallet, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function ClientPortalPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const res = await getClientSubscriptions();
        setData(res);
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (data?.message) {
        return <div className="p-8 text-red-500">Error: {data.message}</div>;
    }

    const { telephony = [], hosting = [], balance = 0 } = data;
    const hasTelephony = telephony.length > 0;
    const hasHosting = hosting.length > 0;
    const totalServices = telephony.length + hosting.length;

    return (
        <div className="flex min-h-screen flex-col bg-muted/10 p-4 md:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Client Portal</h1>
                    <p className="text-muted-foreground">Manage your services, billing, and profile.</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadData}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Stats / Overview Cards */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalServices}</div>
                        <p className="text-xs text-muted-foreground">Hosting & Telephony</p>
                    </CardContent>
                </Card>

                {hasTelephony && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">R {balance.toFixed(2)}</div>
                            <Button variant="link" className="px-0 text-xs h-auto mt-1">Top Up Now</Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="space-y-6">
                {/* HOSTING SECTION */}
                {hasHosting && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Server className="h-5 w-5" /> Hosting Services
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {hosting.map((sub: any) => (
                                <Card key={sub.name} className="overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{sub.site_name}</CardTitle>
                                            <Badge variant={sub.status === 'Active' ? 'default' : 'secondary'}>{sub.status}</Badge>
                                        </div>
                                        <CardDescription>{sub.plan}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-muted-foreground mb-4">
                                            Next Billing: {sub.next_billing_date || "N/A"}
                                        </div>
                                        <Button asChild className="w-full">
                                            <Link href="/handson/control/rpanel">
                                                Go to RPanel <ExternalLink className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* TELEPHONY SECTION */}
                {hasTelephony && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Phone className="h-5 w-5" /> Telephony Services
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {telephony.map((sub: any) => (
                                <Card key={sub.name}>
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{sub.did_number || "No DID Assigned"}</CardTitle>
                                            <Badge variant={sub.status === 'Active' ? 'default' : 'outline'}>{sub.status}</Badge>
                                        </div>
                                        <CardDescription>{sub.plan} ({sub.number_of_lines} Lines)</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <Button variant="outline" className="flex-1">View Details</Button>
                                            <Button variant="secondary" className="flex-1">Config</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {!hasHosting && !hasTelephony && (
                    <Card className="p-8 text-center">
                        <h3 className="text-lg font-medium">No Active Services</h3>
                        <p className="text-muted-foreground mt-2">You don't have any subscriptions yet.</p>
                        <Button className="mt-4" asChild>
                            <Link href="/register">Purchase a Plan</Link>
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
}
