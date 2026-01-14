"use client";

import Link from "next/link";
import {
    CreditCard,
    Phone,
    FileText,
    Wallet,
    Settings,
    Code,
    ArrowRight,
    ScrollText
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Branding } from "@/components/custom/branding";
import React from "react";

const modules = [
    {
        title: "Subscriptions",
        description: "Manage company subscriptions and plans.",
        href: "/handson/control/subscriptions",
        icon: CreditCard,
        color: "text-blue-500",
    },
    {
        title: "Vouchers",
        description: "Create and manage trial and discount vouchers.",
        href: "/handson/control/vouchers",
        icon: Wallet,
        color: "text-indigo-500",
    },
    {
        title: "Telephony",
        description: "Configure telephony settings and DIDs.",
        href: "/handson/control/telephony",
        icon: Phone,
        color: "text-green-500",
    },
    {
        title: "Tender & Tasks",
        description: "Control tender workflows and tasks.",
        href: "/handson/control/tender",
        icon: FileText,
        color: "text-orange-500",
    },
    {
        title: "Finance",
        description: "Manage wallets, ledgers, and payouts.",
        href: "/handson/control/finance",
        icon: Wallet,
        color: "text-purple-500",
    },
    {
        title: "System",
        description: "Configure system-wide settings.",
        href: "/handson/control/system",
        icon: Settings,
        color: "text-gray-500",
    },
    {
        title: "Developer",
        description: "Swagger settings, logs, and caches.",
        href: "/handson/control/developer",
        icon: Code,
        color: "text-red-500",
    },
    {
        title: "Terms & Conditions",
        description: "Manage master legal templates.",
        href: "/handson/control/terms",
        icon: ScrollText,
        color: "text-amber-500",
    },
];

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold italic">
                    <Branding /> Admin
                </h1>
                <p className="text-muted-foreground">Manage your control site configurations and modules.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {modules.map((module) => (
                    <Link key={module.href} href={module.href}>
                        <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-medium">
                                    {module.title}
                                </CardTitle>
                                <module.icon className={`h-5 w-5 ${module.color}`} />
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mb-4">
                                    {module.description}
                                </CardDescription>
                                <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    Access Module <ArrowRight className="ml-1 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
