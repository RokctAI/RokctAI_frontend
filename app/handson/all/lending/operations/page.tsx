"use client";

import React, { useEffect, useState } from "react";
import { triggerLoanInterestAccrual, triggerLoanSecurityShortfall, triggerLoanClassification, getProcessLogs } from "@/app/actions/handson/all/lending/operations";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Settings, Play, ShieldAlert, TrendingUp, History, CheckCircle, XCircle, Clock } from "lucide-react";

export default function OperationsDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);

    // Refresh logs on mount and after actions
    const fetchLogs = async () => {
        const data = await getProcessLogs();
        setLogs(data);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleInterestAccrual = async () => {
        if (!confirm("Run Interest Accrual for ALL loans? This is typically an End-of-Day process.")) return;
        setIsLoading(true);
        const res = await triggerLoanInterestAccrual();
        if (res.success) {
            toast.success(res.message);
            fetchLogs();
        } else {
            toast.error(res.error);
        }
        setIsLoading(false);
    };

    const handleSecurityShortfall = async () => {
        if (!confirm("Check for Security Shortfalls? This will verify LTV ratios for all secured loans.")) return;
        setIsLoading(true);
        const res = await triggerLoanSecurityShortfall();
        if (res.success) {
            toast.success(res.message);
            fetchLogs();
        } else {
            toast.error(res.error);
        }
        setIsLoading(false);
    };

    const handleClassification = async () => {
        setIsLoading(true);
        const res = await triggerLoanClassification();
        if (res.success) {
            toast.success(res.message);
            fetchLogs();
        } else {
            toast.error(res.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Settings className="w-8 h-8 mr-3 text-gray-700" />
                    Lending Operations
                </h1>
                <p className="text-gray-500 mt-2">
                    Orchestrate end-of-day processes and monitor automated periodic tasks.
                    These jobs normally run automatically at midnight.
                </p>
            </div>

            {/* Operations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Interest Accrual Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Interest Accrual</h3>
                    <p className="text-sm text-gray-500 mt-2 min-h-[40px]">
                        Calculate and book interest for all active Term Loans based on their repayment schedule.
                    </p>
                    <button
                        onClick={handleInterestAccrual}
                        disabled={isLoading}
                        className="mt-6 w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Run Job
                    </button>
                    <p className="mt-3 text-xs text-center text-gray-400">Usually runs Daily at 00:00</p>
                </div>

                {/* Security Shortfall Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                        <ShieldAlert className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">LTV Monitor</h3>
                    <p className="text-sm text-gray-500 mt-2 min-h-[40px]">
                        Check if pledged assets have dropped in value below the required Loan-to-Value ratio.
                    </p>
                    <button
                        onClick={handleSecurityShortfall}
                        disabled={isLoading}
                        className="mt-6 w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Run Check
                    </button>
                    <p className="mt-3 text-xs text-center text-gray-400">Usually runs Daily at 00:00</p>
                </div>

                {/* Classification Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                        <Settings className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Loan Grading</h3>
                    <p className="text-sm text-gray-500 mt-2 min-h-[40px]">
                        Classify loans (Standard, Sub-Standard, Doubtful, Loss) based on days past due.
                    </p>
                    <button
                        onClick={handleClassification}
                        disabled={isLoading}
                        className="mt-6 w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Run Grading
                    </button>
                    <p className="mt-3 text-xs text-center text-gray-400">Usually runs Daily at 00:00</p>
                </div>
            </div>

            {/* Recent Executions Log */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <History className="w-5 h-5 mr-2 text-gray-400" />
                        Recent Job Executions
                    </h3>
                    <button onClick={fetchLogs} className="text-sm text-blue-600 hover:underline">Refresh</button>
                </div>
                {logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 italic">No recent jobs found.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {logs.map((log, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    {log.status === "Completed" || log.docstatus === 1 ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-gray-400" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{log.type} <span className="text-gray-400 font-normal">#{log.name}</span></p>
                                        <p className="text-xs text-gray-500">{new Date(log.creation).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${(log.status === "Completed" || log.docstatus === 1) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                        }`}>
                                        {log.status === "Submitted" ? "Completed" : (log.status || "Unknown")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
