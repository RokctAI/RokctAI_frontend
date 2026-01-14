"use client";

import React, { useEffect, useState } from "react";
import { getLoanApplication } from "@/app/actions/handson/all/lending/application";
import { runDecisionEngine } from "@/app/actions/handson/all/lending/decision_engine";
import { FileUp, CheckCircle, AlertCircle, X, Loader2, Printer, Smartphone, Mail, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getSessionCurrency } from "@/app/actions/currency";

export default function LoanApplicationDetails({ params }: { params: { id: string } }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState("ZAR");

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currency }).format(amount);
    }

    useEffect(() => {
        getLoanApplication(params.id).then(res => {
            setData(res.data);
            setLoading(false);
        });
        getSessionCurrency().then(c => setCurrency(c));
    }, [params.id]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
    if (!data) return <div className="p-12 text-center text-red-500">Application not found</div>;

    const sections = [
        {
            title: "Applicant Details", items: [
                { label: "Applicant", value: data.applicant },
                { label: "Type", value: data.applicant_type }
            ]
        },
        {
            title: "Loan Details", items: [
                { label: "Product", value: data.loan_product },
                { label: "Amount", value: formatCurrency(data.loan_amount) },
                { label: "Status", value: <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">{data.status}</span> }
            ]
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
                    <p className="text-gray-500">View and manage loan application details</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href={`/portal/quote/${params.id}`}
                        target="_blank"
                        className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 font-medium transition-colors"
                    >
                        <Smartphone className="w-4 h-4 mr-2" />
                        Client Portal
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{section.title}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {section.items.map((item, i) => (
                                    <div key={i}>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">{item.label}</p>
                                        <div className="text-gray-900 font-medium">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Supporting Documents Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Supporting Documents (FICA)</h3>
                        <div className="space-y-3">
                            <DocumentRow label="ID Document" required />
                            <DocumentRow label="Proof of Address" required />
                            <DocumentRow label="Bank Statement (3 Months)" required />
                            <DocumentRow label="Payslip" />
                        </div>
                    </div>

                    {/* Debt Enforcement / Collections Workflow */}
                    <div className="space-y-6">
                        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                            <div className="flex items-center space-x-2 text-red-800 mb-4">
                                <AlertCircle className="w-5 h-5" />
                                <h3 className="font-bold">Debt Enforcement</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Step 1: Call */}
                                <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Step 1: Soft Collection</h4>
                                    <p className="text-xs text-gray-500 mb-3">Call client before statutory notice.</p>
                                    <button
                                        onClick={() => {
                                            const note = prompt("Enter call outcome:");
                                            if (note) toast.success("Call logged", { description: note });
                                        }}
                                        className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center"
                                    >
                                        <span className="mr-2">📞</span> Log Call
                                    </button>
                                </div>

                                {/* Step 2: Auto-Send S129 */}
                                <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Step 2: Legal Action</h4>
                                    <p className="text-xs text-gray-500 mb-3">Default &gt; 20 days.</p>
                                    <div className="flex items-center text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Notice sends automatically via system scheduler.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Standard Actions */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                            <Link
                                href={`/handson/all/lending/reports/form-20/${params.id}`}
                                className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 font-medium transition-colors"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Form 20 Quote
                            </Link>

                            <button
                                onClick={async () => {
                                    const toastId = toast.loading("Running Decision Engine...");
                                    const res = await runDecisionEngine(params.id);
                                    if (res.success) {
                                        toast.success(`${res.data.decision}: ${res.data.score} (${res.data.risk_level})`, { id: toastId });
                                        // Optional: Refresh data if needed, but revalidatePath handles it
                                    } else {
                                        toast.error(res.message, { id: toastId });
                                    }
                                }}
                                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors shadow-sm"
                            >
                                <Smartphone className="w-4 h-4 mr-2" />
                                Decision Engine
                            </button>

                            <div className="space-x-3">
                                <button className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                                    Reject
                                </button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DocumentRow({ label, required = false }: { label: string, required?: boolean }) {
    const [status, setStatus] = React.useState<'missing' | 'uploading' | 'uploaded'>('missing');

    // Simulate upload delay for demo
    const handleUpload = () => {
        setStatus('uploading');
        setTimeout(() => setStatus('uploaded'), 1500);
    };

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group">
            <div className="flex items-center space-x-4">
                <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${status === 'uploaded' ? 'bg-green-100 text-green-600' : 'bg-white border border-gray-200 text-gray-400'}
                `}>
                    {status === 'uploaded' ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                    <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{label}</span>
                        {required && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Required</span>}
                    </div>
                    <p className="text-xs text-gray-500">
                        {status === 'uploaded' ? 'Uploaded successfully' : 'Drag and drop or click to upload'}
                    </p>
                </div>
            </div>

            {status === 'uploaded' ? (
                <button
                    onClick={() => setStatus('missing')}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            ) : (
                <button
                    onClick={handleUpload}
                    disabled={status === 'uploading'}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
                >
                    {status === 'uploading' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <FileUp className="w-4 h-4 mr-2" />
                    )}
                    {status === 'uploading' ? 'Uploading...' : 'Upload'}
                </button>
            )}
        </div>
    );
}
