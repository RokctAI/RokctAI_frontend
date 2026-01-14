"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoan } from "@/app/actions/handson/all/lending/loan";
import { createLoanRestructure } from "@/app/actions/handson/all/lending/lifecycle";
import { toast } from "sonner";
import { ChevronLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function RestructurePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const loanId = searchParams.get("loan");

    const [loan, setLoan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Fields
    const [newInterest, setNewInterest] = useState("");
    const [newTerm, setNewTerm] = useState("");
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (loanId) {
            getLoan(loanId).then(res => {
                setLoan(res.data);
                setIsLoading(false);
                if (res.data) {
                    setNewInterest(res.data.rate_of_interest);
                    setNewTerm(res.data.repayment_periods);
                }
            });
        }
    }, [loanId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await createLoanRestructure({
            loan: loan.name,
            date: new Date().toISOString().split("T")[0],
            new_interest_rate: parseFloat(newInterest),
            new_term_months: parseInt(newTerm),
            reason: reason
        });

        if (res.success) {
            toast.success("Loan Restructured Successfully");
            router.push(`/handson/all/lending/loan/${loan.name}`);
        } else {
            toast.error(res.error || "Restructure Failed");
        }
        setIsSubmitting(false);
    };

    if (isLoading) return <div className="p-12 text-center text-gray-500">Loading...</div>;
    if (!loan) return <div className="p-12 text-center text-red-500">Loan not found</div>;

    return (
        <div className="max-w-xl mx-auto py-12">
            <Link href={`/handson/all/lending/loan/${loan.name}`} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Loan
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <RefreshCw className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Loan Restructure</h1>
                        <p className="text-gray-500 text-sm">Reschedule terms for Loan #{loan.name}</p>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-900 mb-6">
                            This will create a <strong>Loan Restructure</strong> document, officially changing the repayment schedule and contract terms.
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Interest Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                                    value={newInterest}
                                    onChange={(e) => setNewInterest(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Term (Months)</label>
                                <input
                                    type="number"
                                    step="1"
                                    required
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                                    value={newTerm}
                                    onChange={(e) => setNewTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Restructure</label>
                            <textarea
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none transition-all h-24 resize-none"
                                placeholder="Customer financial difficulty, request for extension, etc."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-sm transition-colors"
                        >
                            {isSubmitting ? "Processing..." : "Confirm Restructure"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
