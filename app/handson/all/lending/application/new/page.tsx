"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createLoanApplication } from "@/app/actions/handson/all/lending/application";
import { getLoanProducts } from "@/app/actions/handson/all/lending/product";
import { getCustomers } from "@/app/actions/handson/all/accounting/selling/sales_order"; // Reusing CRM customer fetch
import { getCompanies } from "@/app/actions/handson/all/hrms/companies";
import { ChevronLeft, Loader2, Package, CheckCircle } from "lucide-react";

export default function NewApplication() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        applicant_type: "Customer",
        applicant: "",
        loan_amount: "",
        loan_product: "",
        company: "",
        repayment_method: "Repay Fixed Amount per Period",
        income: "",
        expenses: "",
        description: ""
    });


    const isSecured = products.find(p => p.name === formData.loan_product)?.is_secured;

    useEffect(() => {
        // Fetch dependencies
        Promise.all([
            getLoanProducts(),
            getCustomers(),
            getCompanies()
        ]).then(([prods, custs, comps]) => {
            setProducts(prods);
            setCustomers(custs);
            setCompanies(comps);
            if (comps.length > 0) {
                setFormData(prev => ({ ...prev, company: comps[0].name }));
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await createLoanApplication({
            ...formData,
            loan_amount: Number(formData.loan_amount),
            // Cast strictly to allowed types if needed, handled by server action validation usually
        } as any);

        if (res.success) {
            toast.success("Application created successfully");
            router.push("/handson/all/lending/application");
        } else {
            toast.error(res.error || "Failed to create application");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    href="/handson/all/lending/application"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">New Application</h1>
                    <p className="text-gray-500 text-sm">Create a new loan request.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Applicant Type</label>
                        <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            value={formData.applicant_type}
                            onChange={(e) => setFormData({ ...formData, applicant_type: e.target.value })}
                        >
                            <option value="Customer">Customer</option>
                            <option value="Employee">Employee</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Applicant</label>
                        {/* For simplicity using a text input or select based on type. Assuming Customer dropdown for now */}
                        {formData.applicant_type === "Customer" ? (
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                value={formData.applicant}
                                onChange={(e) => setFormData({ ...formData, applicant: e.target.value })}
                                required
                            >
                                <option value="">Select Customer</option>
                                {customers.map(c => (
                                    <option key={c.name} value={c.name}>{c.customer_name}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                placeholder="Employee ID (e.g. HR-EMP-001)"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                value={formData.applicant}
                                onChange={(e) => setFormData({ ...formData, applicant: e.target.value })}
                                required
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Loan Product</label>
                        <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            value={formData.loan_product}
                            onChange={(e) => setFormData({ ...formData, loan_product: e.target.value })}
                            required
                        >
                            <option value="">Select Product</option>
                            {products.map(p => (
                                <option key={p.name} value={p.name}>
                                    {p.loan_product_name} ({p.rate_of_interest}%)
                                </option>
                            ))}
                        </select>
                    </div>

                    {!isSecured ? (
                        <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="col-span-2 flex items-center mb-2">
                                <h3 className="text-sm font-bold text-blue-800">Affordability Assessment (Reg 23A)</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-blue-700">Net Income</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-white border border-blue-200 rounded-lg text-sm"
                                    placeholder="0.00"
                                    onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-blue-700">Total Expenses</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-white border border-blue-200 rounded-lg text-sm"
                                    placeholder="0.00"
                                    onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <div className="text-sm text-green-800">
                                <span className="font-bold block">Affordability Exempt</span>
                                Asset-backed transactions are exempt from Reg 23A income assessments.
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Loan Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                            <input
                                type="number"
                                className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                value={formData.loan_amount}
                                onChange={(e) => setFormData({ ...formData, loan_amount: e.target.value })}
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    {isSecured && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 col-span-1 md:col-span-2">
                            <div className="flex items-center text-amber-800 font-bold text-sm">
                                <Package className="w-4 h-4 mr-2" />
                                Pawn / Asset Details (Collateral)
                            </div>
                            <p className="text-xs text-amber-700">
                                This is a secured loan. Please describe the asset being handed over (Make, Model, Serial, Condition).
                            </p>
                            <textarea
                                className="w-full p-3 bg-white border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-200 outline-none"
                                rows={3}
                                placeholder="e.g. 2018 Samsung TV, Serial #12345, Good Condition, Remote included."
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Company</label>
                        <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            required
                        >
                            <option value="">Select Company</option>
                            {companies.map(c => (
                                <option key={c.name} value={c.name}>{c.company_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm shadow-blue-200 flex items-center"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Submit Application
                    </button>
                </div>
            </form>
        </div>
    );
}
