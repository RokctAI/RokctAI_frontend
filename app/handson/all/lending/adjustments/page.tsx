"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoan } from "@/app/actions/handson/all/lending/loan";
import { createBalanceAdjustment } from "@/app/actions/handson/all/lending/lifecycle";
import { getSessionCurrency } from "@/app/actions/currency";
import { toast } from "sonner";
import { ChevronLeft, Scale } from "lucide-react";
import Link from "next/link";

export default function AdjustmentsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const loanId = searchParams.get("loan");

    const [loan, setLoan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [type, setType] = useState<"Credit Adjustment" | "Debit Adjustment">("Credit Adjustment");
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const [currency, setCurrency] = useState("ZAR");

    useEffect(() => {
        getSessionCurrency().then(c => setCurrency(c));
    }, []);

    useEffect(() => {
        if (loanId) {
            getLoan(loanId).then(res => {
                setLoan(res.data);
                setIsLoading(false);
            });
        }
    }, [loanId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return toast.error("Enter valid amount");

        setIsSubmitting(true);
        const res = await createBalanceAdjustment({
            loan: loan.name,
            amount: parseFloat(amount),
            type: type,
            remarks: remarks
        });

        if (res.success) {
            toast.success("Adjustment Posted Successfully");
            router.push(`/handson/all/lending/loan/${loan.name}`);
        } else {
            toast.error(res.error || "Adjustment Failed");
        }
        setIsSubmitting(false);
    };

    if (isLoading) return <div className="p-12 text-center text-gray-500">Loading...</div>;
    if (!loan) return <div className="p-12 text-center text-red-500">Loan not found</div>;

    const outstanding = (loan.loan_amount || 0) - (loan.total_principal_paid || 0);

    return (
        <div className="max-w-xl mx-auto py-12">
            <Link href={`/handson/all/lending/loan/${loan.name}`} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Loan
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Scale className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Balance Adjustment</h1>
                        <p className="text-gray-500 text-sm">Manual GL Correction for Loan #{loan.name}</p>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Type Toggle */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setType("Credit Adjustment")}
                                className={`py-2 text-sm font-medium rounded-lg transition-all ${type === "Credit Adjustment" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                Credit Adjustment
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("Debit Adjustment")}
                                className={`py-2 text-sm font-medium rounded-lg transition-all ${type === "Debit Adjustment" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                Debit Adjustment
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600">
                            {type === "Credit Adjustment" ? (
                                <p>Reduces the balance (like a payment or waiver). <br />Outstanding: <strong>{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currency }).format(outstanding)}</strong></p>
                            ) : (
                                <p>Increases the balance (like a charge or reversal). <br />Outstanding: <strong>{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currency }).format(outstanding)}</strong></p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{currency}</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full pl-8 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                            <textarea
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all h-24 resize-none"
                                placeholder="Reason for adjustment..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-sm transition-colors"
                        >
                            {isSubmitting ? "Posting..." : "Post Adjustment"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
