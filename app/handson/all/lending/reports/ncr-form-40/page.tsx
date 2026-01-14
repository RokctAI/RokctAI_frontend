"use client";

import React, { useState, useEffect } from "react";
import { getNCRForm40Data, NCRForm40Data } from "@/app/actions/handson/all/lending/ncr_reports";
import { getSessionCurrency } from "@/app/actions/currency";
import { Loader2, AlertCircle, Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NCRForm40Page() {
    const [data, setData] = useState<NCRForm40Data | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currency, setCurrency] = useState("ZAR");

    useEffect(() => {
        loadData();
        getSessionCurrency().then(c => setCurrency(c));
    }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await getNCRForm40Data({});
        if (res.error) {
            setError(res.error);
            toast.error(res.error);
        } else {
            setData(res.data);
        }
        setLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex items-center space-x-3 text-red-800">
                <AlertCircle className="w-6 h-6" />
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12 print:p-0 print:max-w-none">
            {/* Header - No Print */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center space-x-4">
                    <Link href="/handson/all/lending/reports" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">NCR Form 40 Data</h1>
                        <p className="text-sm text-gray-500">Annual Financial & Operational Return Helper</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Print Report</span>
                    </button>
                    {/* Placeholder for CSV Export */}
                    <button
                        disabled
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV (Coming Soon)</span>
                    </button>
                </div>
            </div>

            {/* Compliance Note */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 print:hidden">
                <p className="text-sm text-blue-700">
                    <strong>Note to Accounting Officer:</strong> This report aggregates data from the Lending Management System to assist in completing NCR Form 40.
                    Please verify all figures against the General Ledger before submission. Non-Lending income (e.g., Investments) is not included here.
                </p>
            </div>

            {/* The "Form" View */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden print:border-none print:shadow-none">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 print:bg-white print:border-b-2 print:border-black">
                    <h2 className="text-xl font-bold text-gray-900 text-center uppercase tracking-wide">
                        Statistical Return - Form 40 Data
                    </h2>
                    <p className="text-center text-gray-500 text-sm mt-1">Based on Lending Module Activity</p>
                </div>

                <div className="p-8 space-y-10">

                    {/* SECTION 1: INCOME STATEMENT */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                            1. Income Statement (Lending Activities)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            <ReportRow label="Interest Income (NCA)" value={data?.income_statement.revenue.interest_income_nca} currency={currency} />
                            <ReportRow label="Initiation Fees" value={data?.income_statement.revenue.initiation_service_fees} currency={currency} />
                            <ReportRow label="Service Fees" value={data?.income_statement.revenue.initiation_service_fees} currency={currency} />{/* Simplified mapping since API returns combined */}
                            <div className="border-t border-gray-100 my-2 col-span-2"></div>
                            <ReportRow label="Less: Bad Debts Written Off" value={data?.income_statement.expenses.bad_debt_write_offs} isNegative currency={currency} />
                            <div className="border-t border-black my-2 col-span-2"></div>
                            <ReportRow label="Total Revenue (Calculated Proxy)" value={data?.income_statement.revenue.total_revenue} bold currency={currency} />
                        </div>
                    </section>

                    {/* SECTION 2: BALANCE SHEET */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                            2. Balance Sheet (Loan Book)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            <ReportRow label="Gross Debtors (Outstanding Balance)" value={data?.balance_sheet.gross_debtors} currency={currency} />
                            <ReportRow label="Less: Provision for Bad Debt" value={data?.balance_sheet.provision_bad_debt} isNegative currency={currency} />
                            <div className="border-t border-black my-2 col-span-2"></div>
                            <ReportRow label="Net Debtors" value={data?.balance_sheet.net_debtors} bold currency={currency} />
                        </div>
                    </section>

                    {/* SECTION 3: OPERATIONAL IS REPLACED BY PAGE 3 & 4 */}
                </div>

                {/* PAGE 3: BEE & EMPLOYMENT */}
                <div className="p-8 space-y-8 print:break-before-page">
                    <div className="border-b-2 border-black pb-4 mb-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-xl font-bold uppercase">BEE & EMPLOYMENT</h1>
                                <p>Form 40 - Page 3 of 4</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 12: BEE */}
                    <section>
                        <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase">12. Black Economic Empowerment</h3>
                        <p className="text-sm text-gray-600 mb-4">Please indicate the percentage of ownership/shareholding by:</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <ReportRow label="Historically Disadvantaged Persons (HDP)" value={data?.bee.hdp_ownership_percent} isCurrency={false} suffix="%" />
                                <ReportRow label="Other" value={data?.bee.other_ownership_percent} isCurrency={false} suffix="%" />
                            </div>

                            <div className="space-y-4 text-sm text-gray-500 italic border border-dashed border-gray-300 p-4 rounded">
                                <p>Commitments to Broad Based BEE:</p>
                                <div className="h-6 border-b border-gray-300"></div>
                                <div className="h-6 border-b border-gray-300"></div>
                            </div>
                        </div>
                    </section>

                    {/* Section 13: Employment */}
                    <section>
                        <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase mt-8">13. Employment Equity</h3>

                        <div className="mb-6 space-y-2">
                            <div className="flex justify-between items-center text-sm border-b border-gray-100 py-2">
                                <span>Have you submitted an Employment Equity plan to the Dept of Labour?</span>
                                <div className="flex space-x-4 font-bold">
                                    <span>Yes</span> / <span>No</span>
                                </div>
                            </div>
                        </div>

                        <h4 className="font-semibold text-gray-600 mb-2">13.1 Employment Records</h4>
                        <div className="space-y-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <ReportRow label="Total number of people employed" value={data?.employment.total_employees} isCurrency={false} />
                            <ReportRow label="Number of HDP employed" value={data?.employment.hdp_employees} isCurrency={false} />
                            <ReportRow label="Percentage of total employment (HDP)" value={data?.employment.hdp_percent} isCurrency={false} suffix="%" />
                        </div>
                    </section>
                </div>

                {/* PAGE 4: DECLARATION */}
                <div className="p-8 space-y-8 bg-gray-50/30 print:bg-white print:break-before-page">
                    <div className="border-b-2 border-black pb-4 mb-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-xl font-bold uppercase">DECLARATION</h1>
                                <p>Form 40 - Page 4 of 4</p>
                            </div>
                        </div>
                    </div>

                    <section className="space-y-6">
                        <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase">14. Declaration by Auditor / Accounting Officer</h3>

                        <div className="bg-blue-50 p-6 rounded-lg text-sm text-gray-700 space-y-4 border border-blue-100">
                            <p className="italic">
                                "I the undersigned, am the appointed Auditor / Accounting officer and declare that I have reviewed the information provided in this return and that it reflects the information as provided to me by the registered entity."
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
                            <div className="space-y-6">
                                <div className="border-b border-gray-400 pb-1">
                                    <span className="text-xs text-gray-400 block mb-1">Name of Accounting Officer</span>
                                    <div className="h-6"></div>
                                </div>
                                <div className="border-b border-gray-400 pb-1">
                                    <span className="text-xs text-gray-400 block mb-1">Professional Body</span>
                                    <div className="h-6"></div>
                                </div>
                                <div className="border-b border-gray-400 pb-1">
                                    <span className="text-xs text-gray-400 block mb-1">Registration Number</span>
                                    <div className="h-6"></div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="border-b border-gray-400 pb-1">
                                    <span className="text-xs text-gray-400 block mb-1">Signature</span>
                                    <div className="h-6"></div>
                                </div>
                                <div className="border-b border-gray-400 pb-1">
                                    <span className="text-xs text-gray-400 block mb-1">Date</span>
                                    <div className="h-6"></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* REGULATORY CHECKLIST (Helper for User) */}
                <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6 print:hidden">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Annual Compliance Checklist
                    </h3>
                    <p className="text-sm text-indigo-800 mb-6">
                        According to NCR Regulations, you must submit the following returns **within 6 months of your Financial Year End**:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ChecklistItem
                            label="Form 40 (Annual Financial & Operational Return)"
                            desc="Generated via this report."
                            completed={true}
                        />
                        <ChecklistItem
                            label="Annual Financial Statements (AFS)"
                            desc="Prepared by your Accountant."
                            completed={false}
                        />
                        <ChecklistItem
                            label="Compliance Report"
                            desc="Management declaration of Act compliance."
                            completed={false}
                        />
                        <ChecklistItem
                            label="Compliance Report"
                            desc={
                                <span className="flex items-center">
                                    Annual Regulation 63 Self-Assessment.
                                    <Link href="/handson/all/lending/reports/compliance-report" className="ml-2 underline text-blue-600 hover:text-blue-800 font-semibold">
                                        Fill Report
                                    </Link>
                                </span>
                            }
                            completed={false}
                        />
                        <ChecklistItem
                            label="Assurance Engagement Report"
                            desc={
                                <span className="flex items-center">
                                    Issued by your Auditor.
                                    <Link href="/handson/all/lending/reports/assurance-report" className="ml-2 underline text-blue-600 hover:text-blue-800 font-semibold">
                                        Generate Draft
                                    </Link>
                                </span>
                            }
                            completed={false}
                        />
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-xs text-gray-400 text-center print:hidden">
                    Generated by Rokct Lending Module • {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}

function ChecklistItem({ label, desc, completed }: { label: string, desc: string | React.ReactNode, completed: boolean }) {
    return (
        <div className={`flex items-start p-4 rounded-lg border ${completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
            <div className={`mt-0.5 mr-3 w-5 h-5 rounded border flex items-center justify-center ${completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                {completed && <svg className="w-3.5 h-3.5" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <div>
                <h4 className={`text-sm font-semibold ${completed ? 'text-green-900' : 'text-gray-900'}`}>{label}</h4>
                <div className={`text-xs ${completed ? 'text-green-700' : 'text-gray-500'}`}>{desc}</div>
            </div>
        </div>
    );
}

function ReportRow({ label, value, isNegative = false, bold = false, isCurrency = true, suffix = "", currency = "ZAR" }: any) {
    const displayValue = isCurrency
        ? new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currency }).format(value || 0)
        : value || 0;

    return (
        <div className={`flex justify-between items-center ${bold ? 'font-bold text-gray-900 text-lg' : 'text-gray-600'}`}>
            <span>{label}</span>
            <span className={isNegative ? 'text-red-600' : ''}>
                {isNegative && "("}{displayValue}{suffix}{isNegative && ")"}
            </span>
        </div>
    );
}
