"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Printer, AlertCircle } from "lucide-react";
import { getLendingLicenseDetails } from "@/app/lib/roles";
import { AssuranceReportTemplate } from "@/app/templates/lending/AssuranceReportTemplate";

export default function AssuranceReportPage() {
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState<any>(null);
    const [reportType, setReportType] = useState<'audited' | 'accounting_officer'>('accounting_officer');
    const [yearEnd, setYearEnd] = useState<string>(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        getLendingLicenseDetails().then(res => {
            setCompany(res);
            if (res.financialYearEnd) {
                setYearEnd(res.financialYearEnd);
            }
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto my-8 font-serif text-justify border border-gray-200">
            {/* Control Panel (Hidden on Print) */}
            <div className="bg-gray-50 p-6 border-b border-gray-200 print:hidden flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Entity Type</label>
                        <select
                            value={reportType}
                            onChange={(e: any) => setReportType(e.target.value)}
                            className="p-2 border border-gray-300 rounded text-sm min-w-[200px]"
                        >
                            <option value="accounting_officer">Accounting Officer (Standard)</option>
                            <option value="audited">Registered Auditor (Large Entity)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Financial Year End</label>
                        <input
                            type="date"
                            value={yearEnd}
                            onChange={(e) => setYearEnd(e.target.value)}
                            className="p-2 border border-gray-300 rounded text-sm"
                        />
                    </div>
                </div>
                <button onClick={() => window.print()} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
                    <Printer className="w-4 h-4 mr-2" /> Print for Signature
                </button>
            </div>

            {/* Notification */}
            <div className="bg-yellow-50 p-4 print:hidden border-b border-yellow-100 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                    <strong>Print Instruction:</strong> Use your {reportType === 'audited' ? 'Auditor' : 'Accounting Officer'} Letterhead paper in the printer tray. This report is formatted to fit standard letterhead margins.
                </p>
            </div>

            <div className="p-12 bg-white">
                <AssuranceReportTemplate
                    company={company}
                    date={new Date().toLocaleDateString()}
                    reportType={reportType}
                    yearEnd={yearEnd}
                />
            </div>
        </div>
    );
}
