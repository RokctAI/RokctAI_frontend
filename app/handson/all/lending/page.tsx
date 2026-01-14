"use client";

import React, { useEffect, useState } from "react";
import { getLoans } from "@/app/actions/handson/all/lending/loan";
import { getLoanApplications } from "@/app/actions/handson/all/lending/application";
import {
    CreditCard,
    FileText,
    DollarSign,
    Activity
} from "lucide-react";
import Link from "next/link";

export default function LendingDashboard() {
    const [stats, setStats] = useState({
        activeLoans: 0,
        pendingApps: 0,
        totalDisbursed: 0,
        approvedApps: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [loans, apps] = await Promise.all([
                    getLoans(1, 100), // Fetch manageable chunk for summary
                    getLoanApplications(1, 100)
                ]);

                const activeLoansCount = loans.data.filter((l: any) => l.status === "Disbursed" || l.status === "Partially Disbursed").length;
                const totalDisbursedAmount = loans.data.reduce((sum: number, l: any) => sum + (l.disbursed_amount || 0), 0);

                const pendingAppsCount = apps.data.filter((a: any) => a.status === "Open").length;
                const approvedAppsCount = apps.data.filter((a: any) => a.status === "Approved").length;

                setStats({
                    activeLoans: activeLoansCount,
                    totalDisbursed: totalDisbursedAmount,
                    pendingApps: pendingAppsCount,
                    approvedApps: approvedAppsCount
                });
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    const Widget = ({ title, value, icon: Icon, color, href }: any) => (
        <Link href={href} className="block group">
            <div className={`
                glass-card p-6 rounded-2xl border-none shadow-xl hover:shadow-2xl transition-all duration-300
                relative overflow-hidden group-hover:-translate-y-1
            `}>
                <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                    <Icon className={`w-32 h-32 text-${color}-600`} />
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${color}-100/50 text-${color}-600 ring-1 ring-${color}-200/50`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {isLoading ? null : (
                        <div className={`h-1.5 w-12 rounded-full bg-${color}-100/50 shadow-inner overflow-hidden`}>
                            <div className={`h-full bg-${color}-500 animate-pulse w-2/3`} />
                        </div>
                    )}
                </div>
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
                {isLoading ? (
                    <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
                ) : (
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
                )}
            </div>
        </Link>
    );

    return (
        <div className="space-y-8 p-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">Lending Intelligence</h1>
                    <p className="text-slate-500 font-medium">Real-time portfolio analytics and compliance monitoring.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/handson/all/lending/application/new"
                        className="px-6 py-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 hover:shadow-indigo-300 active:scale-95"
                    >
                        New Application
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Widget
                    title="Active Loans"
                    value={stats.activeLoans}
                    icon={CreditCard}
                    color="blue"
                    href="/handson/all/lending/loan"
                />
                <Widget
                    title="Pending Applications"
                    value={stats.pendingApps}
                    icon={FileText}
                    color="amber"
                    href="/handson/all/lending/application?status=Open"
                />
                <Widget
                    title="Total Disbursed"
                    value={`$${stats.totalDisbursed.toLocaleString()}`}
                    icon={DollarSign}
                    color="emerald"
                    href="/handson/all/lending/loan"
                />
                <Widget
                    title="Approved (Not Disbursed)"
                    value={stats.approvedApps}
                    icon={Activity}
                    color="indigo"
                    href="/handson/all/lending/application?status=Approved"
                />
            </div>

            {/* Recent Activity or Charts could go here via Recharts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center text-gray-400 border-dashed border-2">
                    Chart Placeholder: Loan Portfolio Growth
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center text-gray-400 border-dashed border-2">
                    Chart Placeholder: Repayment Trends
                </div>
            </div>
        </div>
    );
}
