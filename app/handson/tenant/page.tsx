"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    CreditCard,
    Megaphone,
    LifeBuoy,
    Settings,
    ArrowRight,
    Loader2
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StorageDisplay } from "@/components/custom/StorageDisplay";
import { PLATFORM_NAME, getGuestBranding, getBrandingSync } from "@/app/config/platform";
import { Branding } from "@/components/custom/branding";
import React from "react";

import { getSubscriptionStatus } from "@/app/actions/handson/tenant/system/subscriptions";
import { getMyAnnouncements } from "@/app/actions/handson/tenant/announcements/announcements";

export default function TenantDashboardPage() {
    const [subscription, setSubscription] = useState<any>(null);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const [subData, annData] = await Promise.all([
                    getSubscriptionStatus(),
                    getMyAnnouncements()
                ]);
                setSubscription(subData);
                setAnnouncements(annData.slice(0, 3)); // Top 3
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tenant Dashboard</h1>
                    <p className="text-muted-foreground italic">
                        Welcome to your <Branding /> workspace.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <StorageDisplay />
                    {subscription && (
                        <Badge variant="outline" className="px-3 py-1 text-sm border-blue-200 bg-blue-50 text-blue-700">
                            {subscription.plan_name || "Free"} Plan
                        </Badge>
                    )}
                </div>
            </div>

            {/* Quick Stats / Status Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{subscription?.status || "Active"}</div>
                        <p className="text-xs text-muted-foreground">
                            {subscription?.expiry ? `Renews on ${subscription.expiry}` : "Auto-renews monthly"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Operational</div>
                        <p className="text-xs text-muted-foreground">All systems online</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {announcements.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No new announcements.</p>
                            ) : (
                                announcements.map((ann, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="truncate max-w-[200px] font-medium">{ann.title}</span>
                                        <Link href="/handson/tenant/announcements" className="text-blue-600 hover:underline text-xs">View</Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <Link href="/handson/tenant/settings">
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <Settings className="h-6 w-6 text-primary mb-2" />
                                <CardTitle className="text-lg">Settings</CardTitle>
                                <CardDescription>Configure email, printing, and legal terms.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-primary font-medium">
                                    Manage Settings <ArrowRight className="ml-1 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/handson/tenant/support">
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <LifeBuoy className="h-6 w-6 text-blue-600 mb-2" />
                                <CardTitle className="text-lg">Support</CardTitle>
                                <CardDescription>Contact provider support or view ticket history.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-primary font-medium">
                                    Get Help <ArrowRight className="ml-1 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/handson/tenant/announcements">
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <Megaphone className="h-6 w-6 text-yellow-500 mb-2" />
                                <CardTitle className="text-lg">Announcements</CardTitle>
                                <CardDescription>Read the latest updates and news.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-primary font-medium">
                                    View All <ArrowRight className="ml-1 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
