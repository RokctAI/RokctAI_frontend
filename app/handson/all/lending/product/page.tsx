"use client";

import React, { useEffect, useState } from "react";
import { getLoanProducts } from "@/app/actions/handson/all/lending/product";
import { PLATFORM_NAME, getGuestBranding } from "@/app/config/platform";
import { FolderOpen, Star, AlertTriangle } from "lucide-react";

export default function ProductList() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [branding, setBranding] = useState<any>(null);

    useEffect(() => {
        getGuestBranding().then(setBranding);
        getLoanProducts().then((res) => {
            setProducts(res);
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Loan Products</h1>
                <p className="text-gray-500 mt-1 italic">
                    Available lending schemes and configurations based on {branding ? (
                        <span>
                            {branding.before}
                            <span style={branding.style}>{branding.code}</span>
                            {branding.after}
                        </span>
                    ) : PLATFORM_NAME} Lending.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex justify-between">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl animate-pulse" />
                                <div className="w-20 h-6 bg-gray-100 rounded animate-pulse" />
                            </div>
                            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-50 rounded animate-pulse" />
                                <div className="h-4 w-2/3 bg-gray-50 rounded animate-pulse" />
                            </div>
                        </div>
                    ))
                ) : products.length === 0 ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <FolderOpen className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No loan products found</h3>
                        <p className="text-gray-500 mt-1">Configure products in the backend to see them here.</p>
                    </div>
                ) : (
                    products.map((prod) => (
                        <div key={prod.name} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FolderOpen className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                    <div className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center border border-yellow-100">
                                        <Star className="w-3 h-3 mr-1 fill-current" />
                                        {prod.rate_of_interest}% Interest
                                    </div>
                                    {/* NCA Compliance Guardrails */}
                                    {prod.rate_of_interest > 60 ? (
                                        <div className="flex items-center text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Exceeds NCA Max (60%)
                                        </div>
                                    ) : prod.rate_of_interest > 30 ? (
                                        <div className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Short Term Rate ({prod.rate_of_interest}%)
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{prod.loan_product_name}</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Currency</span>
                                    <span className="font-medium">{prod.currency || "ZAR"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Type</span>
                                    <span className="font-medium">{prod.is_term_loan ? "Term Loan" : "Demand Loan"}</span>
                                </div>
                            </div>
                        </div>
                    )))}
            </div>
            {products.length === 0 && !isLoading && (
                <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                    No loan products configured in the system.
                </div>
            )}
        </div>
    );
}
