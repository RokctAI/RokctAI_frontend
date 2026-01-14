"use client";

import React, { useEffect, useState } from "react";
import { getLoanApplication } from "@/app/actions/handson/all/lending/application";
import { getLoanProduct } from "@/app/actions/handson/all/lending/product";
import { getLendingLicenseDetails } from "@/app/lib/roles";
import { calculateNCRQuote, NCR_MAX_SERVICE_FEE_PM } from "@/app/lib/ncr_calculator";
import { Loader2, Printer, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Form20Template } from "@/app/templates/lending/Form20Template";

export default function Form20Page({ params }: { params: { id: string } }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    // Dynamic NCR Calculation
    // Auto-fill defaults to Maximums (User Request)
    const [days, setDays] = useState(30);
    const [desiredServiceFee, setDesiredServiceFee] = useState(NCR_MAX_SERVICE_FEE_PM);
    const [includeInsurance, setIncludeInsurance] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const appRes = await getLoanApplication(params.id);
                if (appRes.error || !appRes.data) throw new Error("Application not found");

                const app = appRes.data;
                const product = await getLoanProduct(app.loan_product);
                const company = await getLendingLicenseDetails();

                setData({ app, product, company });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [params.id]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
    if (!data) return <div className="text-center p-12 text-red-600">Failed to load data for Form 20.</div>;

    const { app, product, company } = data;

    // --- Dynamic Calculation ---
    const isVatRegistered = !!company?.taxId;
    const quoteResult = calculateNCRQuote({
        principal: app.loan_amount || 0,
        days: days,
        interestRateMonthly: ((product?.rate_of_interest || 0) / 12), // Annual to Monthly
        monthlyServiceFee: desiredServiceFee,
        initiationFeePercent: 10, // Default 10% or from strict logic
        vatRate: isVatRegistered ? 15 : 0, // Dynamic VAT based on Tax ID
        includeInsurance: includeInsurance
    });

    return (
        <div className="max-w-4xl mx-auto my-8 space-y-8">
            {/* Control Panel (Test Different Scenarios) */}
            <div className="bg-gray-100 p-6 rounded-lg border border-gray-300 print:hidden relative">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded mr-2">ADMIN</span>
                    Quote Simulator & Compliance Check
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loan Period (Days)</label>
                        <input
                            type="number"
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded p-2 text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">Simulate early settlement</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Fee</label>
                        <div className="flex items-center">
                            <span className="p-2 bg-gray-200 border border-gray-300 border-r-0 rounded-l text-gray-500 text-sm">R</span>
                            <input
                                type="number"
                                value={desiredServiceFee}
                                onChange={(e) => setDesiredServiceFee(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-r p-2 text-sm"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Max R{NCR_MAX_SERVICE_FEE_PM.toFixed(2)}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Insurance</label>
                        <div className="flex items-center space-x-2 mt-2">
                            <input
                                type="checkbox"
                                checked={includeInsurance}
                                onChange={(e) => setIncludeInsurance(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-sm font-medium">Include Credit Life</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Reg 106 (R4.50/R1000)</p>
                    </div>

                    {/* Compliance Status Indicator */}
                    <div className={`p-4 rounded border ${quoteResult.validation.isCompliant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center space-x-2 mb-2">
                            {quoteResult.validation.isCompliant ? (
                                <React.Fragment>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="font-bold text-green-700 text-sm">NCR Compliant</span>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="font-bold text-red-700 text-sm">NON-COMPLIANT</span>
                                </React.Fragment>
                            )}
                        </div>
                        {!quoteResult.validation.isCompliant && (
                            <ul className="text-xs text-red-600 list-disc list-inside">
                                {quoteResult.validation.warnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Render the Official Form 20 Template */}
            <div className="print:m-0">
                <Form20Template
                    app={app}
                    product={product}
                    company={company}
                    quoteResult={quoteResult}
                />
            </div>
        </div>
    );
}
