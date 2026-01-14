"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Search, ChevronRight, Building2, ArrowRightLeft } from "lucide-react";

import { getLoans } from "@/app/actions/handson/all/lending/loan";
import { getBranches } from "@/app/actions/handson/all/lending/transfer";
import { getSessionCurrency } from "@/app/actions/currency";

export default function LoanList() {
    const [loans, setLoans] = useState<any[]>([]);
    const [branches, setBranches] = useState<{ name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currency, setCurrency] = useState("ZAR");

    const [selectedBranch, setSelectedBranch] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currency }).format(amount);
    }

    useEffect(() => {
        const load = async () => {
            const [loanRes, branchRes, currencyVal] = await Promise.all([
                getLoans(1, 100), // Initial load
                getBranches(),
                getSessionCurrency()
            ]);
            setLoans(loanRes.data || []);
            if (branchRes.success) setBranches(branchRes.data);
            setCurrency(currencyVal);
            setIsLoading(false);
        };
        load();
    }, []);

    const handleFilterChange = async (branch: string) => {
        setSelectedBranch(branch);
        setIsLoading(true);
        const filters: any = {};
        if (branch) filters.branch = branch;

        const res = await getLoans(1, 100, filters);
        setLoans(res.data || []);
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 text-gray-400">
                            Loading...
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const filteredLoans = loans.filter(l =>
        l.applicant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Active Loans</h1>
                    <p className="text-gray-500 mt-1">Manage sanctioned and disbursed loans.</p>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={selectedBranch}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none w-full md:w-48 appearance-none bg-white"
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search applicant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none w-full md:w-64"
                        />
                    </div>

                    <Link href="/handson/all/lending/transfer" className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Transfer Loans">
                        <ArrowRightLeft className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {filteredLoans.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <CreditCard className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No loans found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Try adjusting your filters or search terms.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredLoans.map((loan) => (
                            <Link
                                key={loan.name}
                                href={`/handson/all/lending/loan/${loan.name}`}
                                className="block p-4 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                {loan.applicant}
                                            </h3>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                                                <span>{loan.name}</span>
                                                <span>•</span>
                                                <span>{loan.loan_product}</span>
                                                {loan.branch && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                            <Building2 className="w-3 h-3 mr-1" />
                                                            {loan.branch}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-8 text-sm">
                                        <div className="hidden sm:block">
                                            <span className="block text-gray-500 text-xs text-right">Sanctioned</span>
                                            <span className="font-semibold text-gray-900">{formatCurrency(loan.loan_amount)}</span>
                                        </div>
                                        <div className="hidden sm:block">
                                            <span className="block text-gray-500 text-xs text-right">Repaid</span>
                                            <span className="font-semibold text-gray-900">{formatCurrency(loan.total_amount_paid)}</span>
                                        </div>
                                        <span className={`
                                            px-2 py-1 rounded text-xs font-medium
                                            ${loan.status === 'Disbursed' ? 'bg-blue-50 text-blue-700' :
                                                loan.status === 'Settled' ? 'bg-green-50 text-green-700' :
                                                    loan.status === 'Written Off' ? 'bg-red-50 text-red-700' :
                                                        'bg-gray-100 text-gray-700'}
                                        `}>
                                            {loan.status}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


