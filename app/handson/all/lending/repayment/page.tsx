"use client";

import React, { useEffect, useState } from "react";
import { getLoanRepayments } from "@/app/actions/handson/all/lending/repayment";
import { getSessionCurrency } from "@/app/actions/currency";
import { DollarSign, Wallet, Search } from "lucide-react";

export default function RepaymentList() {
    const [repayments, setRepayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currency, setCurrency] = useState("ZAR"); // Added currency state

    // Added local formatCurrency helper
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currency }).format(amount);
    }

    useEffect(() => {
        // Modified useEffect to fetch both repayments and currency
        Promise.all([
            getLoanRepayments(),
            getSessionCurrency()
        ]).then(([repaymentsRes, currencyVal]) => {
            setRepayments(repaymentsRes.data);
            setCurrency(currencyVal);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 w-full bg-gray-50 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Repayments</h1>
                    <p className="text-gray-500 mt-1">Global transaction history.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search transactions..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none w-64" />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden dash-table-container">
                {repayments.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Wallet className="w-8 h-8 text-blue-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No repayments recorded</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Payments received against loans will appear here automatically.
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-sm">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Loan</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {repayments.map((rep) => (
                                <tr key={rep.name} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 text-sm">{rep.name}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{rep.posting_date}</td>
                                    <td className="px-6 py-4 text-blue-600 font-medium text-sm hover:underline cursor-pointer">{rep.against_loan}</td>
                                    <td className="px-6 py-4 font-bold text-emerald-600 text-right text-sm">
                                        +{formatCurrency(rep.amount_paid)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                            Processed
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
