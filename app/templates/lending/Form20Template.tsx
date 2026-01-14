
import React from 'react';

interface Form20TemplateProps {
    app: any;
    product: any;
    company: any;
    calculations: {
        principal: number;
        rate: number;
        term: number;
        installment: number;
        initiationFee: number;
        serviceFee: number;
        totalRepayment: number;
        costOfCredit: number;
    };
    quoteResult?: any;
}

export const Form20Template: React.FC<Form20TemplateProps> = ({ app, product, company, calculations, quoteResult }) => {
    const {
        principal,
        rate,
        term,
        installment,
        initiationFee,
        serviceFee,
        totalRepayment
    } = calculations;

    return (
        <div className="max-w-4xl mx-auto my-8 bg-white p-12 shadow-lg print:shadow-none print:p-0 text-sm md:text-base font-serif text-justify border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b border-black pb-4">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide">Pre-Agreement Statement & Quotation</h1>
                    <p className="text-sm text-gray-600 italic mt-1">Form 20 • National Credit Act 34 of 2005</p>
                </div>
            </div>

            {/* Provider Details */}
            <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                    <h3 className="font-bold border-b border-gray-400 mb-2 uppercase text-xs text-gray-500">Credit Provider</h3>
                    <p className="font-bold text-lg">{company?.companyName || "Credit Provider Name"}</p>
                    <p>NCRCP: {company?.licenseNumber || "NCRCPXXXX"}</p>
                    <p>Address: [Insert Physical Address]</p>
                    <p>Contact: [Insert Number]</p>
                </div>
                <div>
                    <h3 className="font-bold border-b border-gray-400 mb-2 uppercase text-xs text-gray-500">Consumer</h3>
                    <p className="font-bold text-lg">{app?.applicant}</p>
                    <p>ID/Reg No: [Insert ID]</p>
                    <p>Address: [Insert Address]</p>
                    <p>Quote Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-red-600 font-bold">Valid for 5 Days</p>
                </div>
            </div>

            <div className="mb-4 p-4 bg-gray-50 border-l-4 border-black text-xs italic">
                <p><strong>Note:</strong> This document details the terms and costs of the proposed credit agreement. It is a binding offer for 5 business days. You have the right to accept or decline this offer.</p>
            </div>

            {/* Financial Terms */}
            {quoteResult ? (
                <table className="w-full border-collapse border border-black mb-8 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-left w-1/2">Description</th>
                            <th className="border border-black p-2 text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black p-2">Principal Debt (Loan Amount)</td>
                            <td className="border border-black p-2 text-right font-bold">R {quoteResult.capital.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2">Initiation Fee (Once-off)</td>
                            <td className="border border-black p-2 text-right">R {quoteResult.initiationFee.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 bg-gray-50 font-bold">Total Advanced</td>
                            <td className="border border-black p-2 text-right font-bold bg-gray-50">R {(quoteResult.capital + quoteResult.initiationFee).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </table>
            ) : (
                <table className="w-full border-collapse border border-black mb-8 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-left w-1/2">Description</th>
                            <th className="border border-black p-2 text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-black p-2">Principal Debt (Loan Amount)</td>
                            <td className="border border-black p-2 text-right font-bold">R {principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2">Initiation Fee (Once-off)</td>
                            <td className="border border-black p-2 text-right">R {initiationFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 bg-gray-50 font-bold">Total Advanced</td>
                            <td className="border border-black p-2 text-right font-bold bg-gray-50">R {(principal + initiationFee).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </table>
            )}

            {/* Cost of Credit */}
            <h3 className="font-bold text-lg mb-2 uppercase">Cost of Credit</h3>
            <table className="w-full border-collapse border border-black mb-8 text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2 text-left w-1/2">Description</th>
                        <th className="border border-black p-2 text-right">Value</th>
                    </tr>
                </thead>
                {quoteResult ? (
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 text-gray-500">Capital (Principal)</td>
                            <td className="border border-black p-2 text-right text-gray-500">R {quoteResult.capital.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2">Interest</td>
                            <td className="border border-black p-2 text-right">R {quoteResult.interest.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2">Service Fee</td>
                            <td className="border border-black p-2 text-right">R {quoteResult.serviceFee.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2">Initiation Fee</td>
                            <td className="border border-black p-2 text-right">R {quoteResult.initiationFee.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2">VAT (15%)</td>
                            <td className="border border-black p-2 text-right">R {quoteResult.vat.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2">Insurance</td>
                            <td className="border border-black p-2 text-right">R {quoteResult.insurance.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold bg-yellow-50">Total Repayment Amount</td>
                            <td className="border border-black p-2 text-right font-bold bg-yellow-50">R {quoteResult.totalRepayment.toFixed(2)}</td>
                        </tr>
                    </tbody>
                ) : (
                    <tbody>
                        <tr>
                            <td className="border border-black p-2">Interest Rate (Annual)</td>
                            <td className="border border-black p-2 text-right">{rate}%</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2">Monthly Service Fee</td>
                            <td className="border border-black p-2 text-right">R {serviceFee.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2">Number of Installments</td>
                            <td className="border border-black p-2 text-right">{term} Months</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold bg-yellow-50">Monthly Installment (Estimated)</td>
                            <td className="border border-black p-2 text-right font-bold bg-yellow-50">R {(installment + serviceFee).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 font-bold">Total Amount Repayable</td>
                            <td className="border border-black p-2 text-right font-bold">R {(totalRepayment + initiationFee + (serviceFee * term)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                )}
            </table>

            {/* Legal Declarations */}
            <div className="space-y-4 text-xs leading-relaxed text-justify mb-12">
                <p><strong>Early Settlement:</strong> You have the right to settle this agreement at any time without penalty (for small agreements). The settlement amount will be the unpaid balance plus unpaid interest and fees up to the settlement date.</p>
                <p><strong>Default Administration Costs:</strong> If you default on urgency, you will be liable for default administration charges and collection costs as permitted by the Act.</p>
                <p><strong>Marketing Options:</strong> You have the right to decline marketing options.</p>
            </div>

            {/* Asset / Affordability Declaration */}
            {app.is_secured_loan ? (
                <div className="border-2 border-dashed border-gray-400 p-4 mb-8 bg-gray-50">
                    <h3 className="font-bold border-b border-gray-400 mb-2 uppercase text-sm">Security Pledge (Asset-Backed)</h3>
                    <p className="mb-2">I, the undersigned, hereby pledge the following asset as security for this loan. I understand that failure to repay may result in the sale of this asset to recover the debt.</p>
                    <div className="bg-white p-3 border border-gray-300 font-mono text-sm min-h-[60px]">
                        {app.description || "No Asset Description Provided"}
                    </div>
                </div>
            ) : (
                <div className="border border-gray-200 p-4 mb-8">
                    <h3 className="font-bold border-b border-gray-200 mb-2 uppercase text-sm">Affordability Declaration</h3>
                    <p className="italic">I confirm that the income and expense information provided is true and correct, and that I have the financial means to meet these obligations.</p>
                </div>
            )}

            {/* Acceptance */}
            <div className="border border-black p-6 page-break-inside-avoid">
                <h3 className="font-bold border-b border-black mb-4 pb-2">Acceptance of Quote</h3>
                <p className="mb-8">I, the undersigned consumer, hereby acknowledge receipt of this Pre-agreement Statement and Quotation. I confirm that I understand the costs, risks, and obligations associated with this credit agreement.</p>

                <div className="grid grid-cols-2 gap-12 mt-12">
                    <div>
                        <div className="border-b border-gray-400 h-8"></div>
                        <p className="text-xs uppercase mt-1 text-gray-500">Signature of Consumer</p>
                    </div>
                    <div>
                        <div className="border-b border-gray-400 h-8"></div>
                        <p className="text-xs uppercase mt-1 text-gray-500">Date</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
