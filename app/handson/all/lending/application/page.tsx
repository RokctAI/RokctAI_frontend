"use client";

import React, { useEffect, useState } from "react";
import { getLoanApplications } from "@/app/actions/handson/all/lending/application";
import { getSessionCurrency } from "@/app/actions/currency";
import Link from "next/link";
import { Plus, Search, Filter, ChevronRight, FileText } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function ApplicationList() {
    const [apps, setApps] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currency, setCurrency] = useState("ZAR");
    const [searchTerm, setSearchTerm] = useState("");

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currency }).format(amount);
    }

    useEffect(() => {
        Promise.all([
            getLoanApplications(),
            getSessionCurrency()
        ]).then(([res, currencyVal]) => {
            setApps(res.data);
            setCurrency(currencyVal);
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
                    <p className="text-gray-500 mt-1">Review and manage incoming loan requests.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-indigo-200">
                        <span>Decision Engine</span>
                    </button>
                    <Link
                        href="/handson/all/lending/application/new"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-blue-200"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Application</span>
                    </Link>
                </div>
            </div>

            {/* Filters / Search Bar */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                </div>
                {/* Future: Advanced Filter Modal */}
            </div>

            {/* List */}
            <div className="glass-card shadow-2xl border-none rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="p-16 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                        <p className="mt-4 text-slate-500 font-medium">Synchronizing application data...</p>
                    </div>
                ) : apps.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                            <FileText className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No active applications found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">Deployment-ready lending infrastructure waiting for your first lead.</p>
                        <Link
                            href="/handson/all/lending/application/new"
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg"
                        >
                            Initiate Application &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {apps.filter(app =>
                            app.applicant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            app.name?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((app) => (
                            <Link
                                href={`/handson/all/lending/application/${app.name}`}
                                key={app.name}
                                className="block p-6 hover:bg-slate-50/50 transition-all group relative"
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center space-x-5">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                                            {app.applicant?.substring(0, 2)?.toUpperCase() || "NA"}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {app.applicant}
                                                </h3>
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100">
                                                    {app.applicant_type}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs font-semibold text-slate-400 mt-1.5 space-x-3">
                                                <span className="text-slate-500 font-mono">{app.name}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="text-slate-600">{app.loan_product}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="italic">Requested {format(new Date(app.posting_date), "MMM dd, yyyy")}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-10">
                                        <div className="text-right flex flex-col items-end gap-1.5">
                                            <span className="block text-xl font-black text-slate-900 tracking-tight">
                                                {formatCurrency(app.loan_amount || 0)}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                {/* Payout Status Visualization */}
                                                {(app.is_from_mobile && app.skip_documents) ? (
                                                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold px-2 py-0 border leading-tight">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                                                        Ring-fenced
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold px-2 py-0 border leading-tight">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                                                        Withdrawable
                                                    </Badge>
                                                )}

                                                <Badge className={`
                                                    font-black uppercase tracking-tighter px-2 py-0 border leading-tight
                                                    ${app.status === 'Approved' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                                        app.status === 'Rejected' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                                                            'bg-slate-100 text-slate-600 border-slate-200 shadow-inner'}
                                                `}>
                                                    {app.workflow_state || app.status}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Compliance */}
                                                {(app.rate_of_interest || 0) > 60 ? (
                                                    <span className="inline-flex items-center text-[10px] font-black tracking-widest uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                                        High Yield Risk
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-[10px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                        Compliant Rate
                                                    </span>
                                                )}

                                                {/* Risk */}
                                                {app.risk_level ? (
                                                    <span className={`
                                                        inline-flex items-center text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded border
                                                        ${app.risk_level === 'High Risk' ? 'text-rose-700 bg-rose-50 border-rose-100' :
                                                            app.risk_level === 'Medium Risk' ? 'text-amber-700 bg-amber-50 border-amber-100' :
                                                                'text-emerald-700 bg-emerald-50 border-emerald-100'}
                                                    `}>
                                                        {app.risk_level}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                        Undetermined
                                                    </span>
                                                )}
                                            </div>

                                            <span className="text-[10px] font-bold text-slate-400 mt-1">
                                                Processor: {app.owner?.split('@')[0] || "System"}
                                            </span>
                                        </div>
                                        <div className="self-center p-2 rounded-full bg-slate-50 group-hover:bg-blue-50 transition-colors">
                                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
