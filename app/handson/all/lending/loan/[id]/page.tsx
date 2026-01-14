"use client";

import React, { useEffect, useState } from "react";

import { getLoan, getLoanRepaymentSchedule, getAssetAccounts, realisePawnAsset, disburseLoan, releaseSecurity, getLoanTimeline } from "@/app/actions/handson/all/lending/loan";
import { createLoanRepayment } from "@/app/actions/handson/all/lending/repayment";
import { createLoanRefund } from "@/app/actions/handson/all/lending/refund";
import { getSessionCurrency } from "@/app/actions/currency";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Calendar, Package, CheckCircle, Upload, MessageSquare, Clock, AlertTriangle, CornerDownLeft, MoreVertical, ShieldAlert } from "lucide-react";

// Helper for date formatting
const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

export default function LoanDetails({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loan, setLoan] = useState<any>(null);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
    const [currency, setCurrency] = useState("ZAR");

    // Helper for currency formatting
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: currency }).format(amount);
    }

    // Lifecycle Action States
    const [isDisbursing, setIsDisbursing] = useState(false);
    const [isReleasing, setIsReleasing] = useState(false);

    // Refund State
    const [isRefunding, setIsRefunding] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);

    // Repayment Modal State
    const [showRepaymentModal, setShowRepaymentModal] = useState(false);
    const [repaymentAmount, setRepaymentAmount] = useState("");

    // Asset Realisation Modal State
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [assetAccounts, setAssetAccounts] = useState<any[]>([]);
    const [selectedAssetAccount, setSelectedAssetAccount] = useState("");
    const [isRealising, setIsRealising] = useState(false);

    // Menu State
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        Promise.all([
            getLoan(params.id),
            getLoanRepaymentSchedule(params.id),
            getLoanTimeline(params.id)
        ]).then(([l, s, t]) => {
            setLoan(l.data);
            setSchedule(s || []); // Ensure array
            setTimeline(t || []);
            setIsLoading(false);
            if (l.data?.monthly_repayment_amount) {
                setRepaymentAmount(l.data.monthly_repayment_amount.toString());
            }
        });
    }, [params.id]);

    useEffect(() => {
        if (loan?.company && showAssetModal) {
            getAssetAccounts(loan.company).then(setAssetAccounts);
        }
    }, [loan?.company, showAssetModal]);

    useEffect(() => {
        getSessionCurrency().then(c => setCurrency(c));
    }, []);

    const handleRepaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(repaymentAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }

        setIsPaying(true);
        const res = await createLoanRepayment({
            against_loan: loan.name,
            posting_date: new Date().toISOString().split('T')[0],
            amount_paid: amount,
            company: loan.company
        });

        if (res.success) {
            toast.success("Repayment recorded successfully");
            router.refresh();
            window.location.reload();
        } else {
            toast.error(res.error || "Failed to record repayment");
        }
        setIsPaying(false);
        setShowRepaymentModal(false);
    };

    const handleRefund = async () => {
        if (!confirm(`Refund excess amount of ${formatCurrency(loan.excess_amount_paid)}?`)) return;
        setIsRefunding(true);
        const res = await createLoanRefund({
            loan: loan.name,
            amount: loan.excess_amount_paid,
            type: "Excess"
        });

        if (res.success) {
            toast.success("Refund Processed Successfully");
            router.refresh();
            window.location.reload();
        } else {
            toast.error(res.error || "Refund Failed");
        }
        setIsRefunding(false);
    };

    const handleAssetRealisation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssetAccount) return toast.error("Please select an asset account");

        setIsRealising(true);
        const res = await realisePawnAsset({ loan: loan.name, asset_account: selectedAssetAccount });

        if (res.success) {
            toast.success("Asset Realised Successfully! Loan Closed.");
            setShowAssetModal(false);
            router.refresh();
            window.location.reload();
        } else {
            toast.error(res.error || "Failed to realise asset");
        }
        setIsRealising(false);
    };

    const handleDisburse = async () => {
        if (!confirm("Are you sure you want to disburse this loan? This will release funds to the applicant.")) return;
        setIsDisbursing(true);
        const res = await disburseLoan({ loanId: loan.name });
        if (res.success) {
            toast.success("Loan Disbursed Successfully!");
            router.refresh();
            window.location.reload();
        } else {
            toast.error(res.error || "Disbursement Failed");
        }
        setIsDisbursing(false);
    }

    const handleRelease = async () => {
        if (!confirm("Are you sure you want to release the security? This confirms the asset has been returned to the client.")) return;
        setIsReleasing(true);
        const res = await releaseSecurity({ loanId: loan.name });
        if (res.success) {
            toast.success("Security Released Successfully!");
            router.refresh();
            window.location.reload();
        } else {
            toast.error(res.error || "Release Failed");
        }
        setIsReleasing(false);
    }

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading loan details...</div>;
    if (!loan) return <div className="p-8 text-center text-red-500">Loan not found</div>;


    return (
        <div className="max-w-5xl mx-auto space-y-6 relative pb-12">
            {showRepaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Make Repayment</h3>
                        <p className="text-gray-500 text-sm">Enter the amount to repay for Loan #{loan.name}.</p>

                        <form onSubmit={handleRepaymentSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Amount</label>
                                <div className="relative mt-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={repaymentAmount}
                                        onChange={(e) => setRepaymentAmount(e.target.value)}
                                        autoFocus
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRepaymentModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPaying}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                                >
                                    {isPaying ? "Processing..." : "Confirm Payment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAssetModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center space-x-3 text-amber-600 mb-2">
                            <Package className="w-6 h-6" />
                            <h3 className="text-xl font-bold text-gray-900">Realise Pledged Asset</h3>
                        </div>
                        <p className="text-gray-500 text-sm">
                            This will seize the collateral and mark the loan as settled.
                            Please select the inventory account to book the asset value into.
                        </p>

                        <form onSubmit={handleAssetRealisation} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Asset Inventory Account</label>
                                <select
                                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-100 outline-none"
                                    value={selectedAssetAccount}
                                    onChange={(e) => setSelectedAssetAccount(e.target.value)}
                                    required
                                >
                                    <option value="">Select Account...</option>
                                    {assetAccounts.map(acc => (
                                        <option key={acc.name} value={acc.name}>{acc.account_name} ({acc.name})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAssetModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRealising}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                                >
                                    {isRealising ? "Processing..." : "Seize & Close Loan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/handson/all/lending/loan"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-bold text-gray-900">Loan #{loan.name}</h1>
                            {loan.classification_name && (
                                <span className={`px-2.5 py-0.5 rounded text-xs font-medium border flex items-center
                                    ${loan.classification_name === "Standard" ? "bg-green-50 text-green-700 border-green-200" :
                                        loan.classification_name === "Sub-Standard" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                            "bg-red-50 text-red-700 border-red-200"}`}>
                                    {loan.classification_name === "Standard" ? <CheckCircle className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
                                    {loan.classification_name} ({loan.days_past_due || 0} DPD)
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm">For {loan.applicant}</p>
                    </div>
                </div>
                <div className="flex space-x-3 items-center">
                    {/* OPERATIONS DROPDOWN */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                <Link
                                    href={`/handson/all/lending/restructure?loan=${loan.name}`}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Refinance / Restructure
                                </Link>
                                <Link
                                    href={`/handson/all/lending/adjustments?loan=${loan.name}`}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Balance Adjustments
                                </Link>
                                <Link
                                    href={`/handson/all/lending/demand?loan=${loan.name}`}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Raise Demand / Penalty
                                </Link>
                                <div className="border-t border-gray-100 my-1"></div>
                                <Link
                                    href={`/handson/all/lending/write-off?loan=${loan.name}`}
                                    className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    Write Off Bad Debt
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link
                        href={`/handson/all/lending/repayment?loan=${loan.name}`}
                        className="px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl font-medium transition-colors"
                    >
                        View History
                    </Link>

                    {/* REFUND BUTTON - If Excess > 0 */}
                    {loan.excess_amount_paid > 0 && (
                        <button
                            onClick={handleRefund}
                            disabled={isRefunding}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center"
                        >
                            <CornerDownLeft className="w-4 h-4 mr-2" />
                            Refund {formatCurrency(loan.excess_amount_paid)}
                        </button>
                    )}

                    {/* DISBURSE BUTTON - Only for Sanctioned */}
                    {loan.status === "Sanctioned" && (
                        <button
                            onClick={handleDisburse}
                            disabled={isDisbursing}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                        >
                            {isDisbursing ? "Disbursing..." : "Disburse Loan"}
                        </button>
                    )}

                    {/* RELEASE SECURITY BUTTON - For Paid/Closure Requested */}
                    {loan.is_secured_loan && (loan.status === "Paid" || loan.status === "Loan Closure Requested") && (
                        <button
                            onClick={handleRelease}
                            disabled={isReleasing}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                        >
                            {isReleasing ? "Releasing..." : "Release Security"}
                        </button>
                    )}

                    {/* ASSET REALISATION BUTTON (Only for Secured Loans in Disbursement/Default) */}
                    {loan.is_secured_loan && ["Disbursed", "Partially Disbursed", "Default", "Overdue"].includes(loan.status) && (
                        <button
                            onClick={() => setShowAssetModal(true)}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                        >
                            Realise Asset
                        </button>
                    )}

                    {/* REPAYMENT BUTTON (Active Loans) */}
                    {["Disbursed", "Partially Disbursed", "Default", "Overdue"].includes(loan.status) && (
                        <button
                            onClick={() => setShowRepaymentModal(true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                        >
                            Make Repayment
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <span className="text-sm font-medium text-gray-500">Total Sanctioned</span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(loan.loan_amount)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <span className="text-sm font-medium text-gray-500">Total Paid</span>
                    <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(loan.total_amount_paid)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <span className="text-sm font-medium text-gray-500">Outstanding</span>
                    <p className="text-2xl font-bold text-amber-600 mt-2">
                        {formatCurrency((loan.loan_amount || 0) - (loan.total_principal_paid || 0))}
                    </p>
                </div>
            </div>

            {/* Repayment Schedule */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                        Repayment Schedule
                    </h3>
                </div>
                {schedule.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 italic">No schedule generated yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Principal</th>
                                    <th className="px-6 py-3">Interest</th>
                                    <th className="px-6 py-3">Total</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {schedule.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-gray-900">{row.payment_date}</td>
                                        <td className="px-6 py-3 text-gray-600">{formatCurrency(row.principal_amount)}</td>
                                        <td className="px-6 py-3 text-gray-600">{formatCurrency(row.interest_amount)}</td>
                                        <td className="px-6 py-3 font-medium text-gray-900">{formatCurrency(row.total_payment)}</td>
                                        <td className="px-6 py-3">
                                            {/* Basic status inference if field missing */}
                                            {row.paid ? (
                                                <span className="text-green-600 font-medium">Paid</span>
                                            ) : (
                                                <span className="text-amber-600 font-medium">Pending</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* AUDIT LOG TIMELINE */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-gray-400" />
                        Audit Trail
                    </h3>
                </div>
                {timeline.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 italic">No activity recorded yet.</div>
                ) : (
                    <div className="p-6">
                        <div className="relative border-l border-gray-200 ml-3 space-y-6">
                            {timeline.map((event: any, i: number) => (
                                <div key={i} className="mb-8 ml-6 relative">
                                    <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-9 ring-4 ring-white">
                                        <MessageSquare className="w-3 h-3 text-blue-600" />
                                    </span>
                                    <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900">
                                        {event.subject || "System Info"}
                                        {event.comment_type === "Info" && <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded ml-3">Info</span>}
                                    </h3>
                                    <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                                        {formatDate(event.creation)} • {event.owner}
                                    </time>
                                    <div className="mb-4 text-sm font-normal text-gray-500 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: event.content }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
