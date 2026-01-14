"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getLendingReport } from "@/app/actions/handson/all/lending/reports";
import { getSessionCurrency } from "@/app/actions/currency";
import { LENDING_REPORTS, ReportConfig } from "@/app/lib/reports_config";
import { FileText, Loader2, Download, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";

export default function ReportsDashboard() {
    const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
    const [reportData, setReportData] = useState<{ columns: any[], data: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currency, setCurrency] = useState("ZAR");

    useEffect(() => {
        getSessionCurrency().then(c => setCurrency(c));
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currency }).format(val);
    };

    const handleLoadReport = async (report: ReportConfig) => {
        setIsLoading(true);
        setSelectedReport(report);
        setReportData(null); // Clear previous

        const res = await getLendingReport(report.name, {});
        if (res.error) {
            toast.error(res.error);
        } else {
            setReportData({ columns: res.columns, data: res.data });
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Regulatory & Operational Reports</h1>
                <p className="text-gray-500 mt-1">Generate standard reports for compliance and auditing.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar List */}
                <div className="lg:col-span-1 space-y-2">
                    {LENDING_REPORTS.map((rep) => (
                        <button
                            key={rep.name}
                            onClick={() => handleLoadReport(rep)}
                            className={`w-full flex items-center p-3 rounded-xl transition-colors text-sm font-medium ${selectedReport?.name === rep.name
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent"
                                }`}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            {rep.title}
                        </button>
                    ))}
                </div>

                {/* Report Viewer */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[400px] flex flex-col">
                    {!selectedReport ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                            <TableIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select a report to generate</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">{selectedReport.title}</h3>
                                {reportData && reportData.data.length > 0 && (
                                    <button
                                        onClick={() => toast.info("Export feature coming soon")}
                                        className="text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 overflow-auto p-0 relative">
                                {isLoading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                    </div>
                                ) : reportData?.data?.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">No data found for this report.</div>
                                ) : (
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                {reportData?.columns.map((col: any, idx: number) => (
                                                    <th key={idx} className="px-6 py-3 border-b border-gray-200">
                                                        {col.label || col.fieldname}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {reportData?.data.map((row: any, rIdx: number) => (
                                                <tr key={rIdx} className="hover:bg-gray-50">
                                                    {reportData?.columns.map((col: any, cIdx: number) => (
                                                        <td key={cIdx} className="px-6 py-3 text-gray-700">
                                                            {/* Simple formatter */}
                                                            {typeof row[col.fieldname] === 'number' && col.fieldname.includes('amount')
                                                                ? formatCurrency(row[col.fieldname])
                                                                : row[col.fieldname]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
