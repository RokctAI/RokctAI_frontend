"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoan } from "@/app/actions/handson/all/lending/loan";
import { createLoanDemand } from "@/app/actions/handson/all/lending/demand";
import { toast } from "sonner";
import { ChevronLeft, Gavel } from "lucide-react";
import Link from "next/link";

export default function DemandPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const loanId = searchParams.get("loan");

    const [loan, setLoan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form
    const [type, setType] = useState<"Penalty" | "Charges">("Penalty");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

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
        const res = await createLoanDemand({
            loan: loan.name,
            demand_type: type,
            amount: parseFloat(amount),
            date: date
        });

        if (res.success) {
            toast.success("Demand Raised Successfully");
            router.push(`/handson/all/lending/loan/${loan.name}`);
        } else {
            toast.error(res.error || "Failed to Raise Demand");
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
                    <div className="p-3 bg-indigo-50 rounded-lg">
                        <Gavel className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Raise Demand / Charge</h1>
                        <p className="text-gray-500 text-sm">Apply penalty or ad-hoc charge to Loan #{loan.name}</p>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Type Toggle */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setType("Penalty")}
                                className={`py-2 text-sm font-medium rounded-lg transition-all ${type === "Penalty" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                Penalty
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("Charges")}
                                className={`py-2 text-sm font-medium rounded-lg transition-all ${type === "Charges" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                Ad-Hoc Charge
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full pl-8 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Demand Date</label>
                            <input
                                type="date"
                                required
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-sm transition-colors"
                        >
                            {isSubmitting ? "Processing..." : "Submit Demand"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
