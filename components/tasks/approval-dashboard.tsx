"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type LeaveRequest = {
    name: string;
    employee_name: string;
    leave_type: string;
    from_date: string;
    to_date: string;
    total_leave_days: number;
    description: string;
};

type ExpenseRequest = {
    name: string;
    employee_name: string;
    total_claimed_amount: number;
    remark: string;
    posting_date: string;
};

interface ApprovalDashboardProps {
    leaves: LeaveRequest[];
    expenses: ExpenseRequest[];
}

export function ApprovalDashboard({ leaves: initialLeaves, expenses: initialExpenses }: ApprovalDashboardProps) {
    const [activeTab, setActiveTab] = useState<'leaves' | 'expenses'>('leaves');
    const [leaves, setLeaves] = useState(initialLeaves);
    const [expenses, setExpenses] = useState(initialExpenses);
    const [processing, setProcessing] = useState<string | null>(null);

    const handleAction = async (doctype: "Leave Application" | "Expense Claim", name: string, action: "Approve" | "Reject") => {
        setProcessing(name);
        try {
            const { processApproval } = await import("@/app/actions/ai/hr");
            const result = await processApproval({ doctype, name, action });

            if (result.success) {
                toast.success(`${doctype} ${action}d`);
                // Optimistic update
                if (doctype === "Leave Application") {
                    setLeaves(prev => prev.filter(l => l.name !== name));
                } else {
                    setExpenses(prev => prev.filter(e => e.name !== name));
                }
            } else {
                toast.error(result.error || "Action failed");
            }
        } catch (e) {
            toast.error("An error occurred");
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden w-full max-w-md text-sm text-white">
            <div className="flex border-b border-zinc-700">
                <button
                    onClick={() => setActiveTab('leaves')}
                    className={`flex-1 py-3 font-medium text-center transition-colors ${activeTab === 'leaves' ? 'bg-zinc-800 text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400 hover:bg-zinc-800/50'}`}
                >
                    Leave Requests ({leaves.length})
                </button>
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`flex-1 py-3 font-medium text-center transition-colors ${activeTab === 'expenses' ? 'bg-zinc-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-800/50'}`}
                >
                    Expense Claims ({expenses.length})
                </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-3 custom-scrollbar">
                <AnimatePresence>
                    {activeTab === 'leaves' ? (
                        leaves.length === 0 ? (
                            <p className="text-zinc-500 text-center py-8">No pending leave requests.</p>
                        ) : (
                            leaves.map((leave) => (
                                <motion.div
                                    key={leave.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="bg-zinc-800/50 border border-zinc-700/50 rounded p-3"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-semibold">{leave.employee_name}</div>
                                            <div className="text-xs text-zinc-400">{leave.leave_type} • {leave.total_leave_days} Day(s)</div>
                                        </div>
                                        <div className="text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">{leave.name}</div>
                                    </div>
                                    <div className="text-xs text-zinc-300 mb-3 bg-zinc-900/50 p-2 rounded">
                                        {leave.description || "No reason provided."}
                                        <div className="mt-1 text-zinc-500">{leave.from_date} ➔ {leave.to_date}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction("Leave Application", leave.name, "Reject")}
                                            disabled={processing === leave.name}
                                            className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-300 py-1.5 rounded text-xs transition-colors border border-red-900/30"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction("Leave Application", leave.name, "Approve")}
                                            disabled={processing === leave.name}
                                            className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-300 py-1.5 rounded text-xs transition-colors border border-green-900/30"
                                        >
                                            {processing === leave.name ? "..." : "Approve"}
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )
                    ) : (
                        expenses.length === 0 ? (
                            <p className="text-zinc-500 text-center py-8">No pending expense claims.</p>
                        ) : (
                            expenses.map((expense) => (
                                <motion.div
                                    key={expense.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="bg-zinc-800/50 border border-zinc-700/50 rounded p-3"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-semibold">{expense.employee_name}</div>
                                            <div className="text-xs text-zinc-400 font-mono">${expense.total_claimed_amount.toFixed(2)}</div>
                                        </div>
                                        <div className="text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">{expense.name}</div>
                                    </div>
                                    <div className="text-xs text-zinc-300 mb-3 bg-zinc-900/50 p-2 rounded">
                                        {expense.remark || "No details."}
                                        <div className="mt-1 text-zinc-500">Date: {expense.posting_date}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction("Expense Claim", expense.name, "Reject")}
                                            disabled={processing === expense.name}
                                            className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-300 py-1.5 rounded text-xs transition-colors border border-red-900/30"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction("Expense Claim", expense.name, "Approve")}
                                            disabled={processing === expense.name}
                                            className="flex-1 bg-green-900/20 hover:bg-green-900/40 text-green-300 py-1.5 rounded text-xs transition-colors border border-green-900/30"
                                        >
                                            {processing === expense.name ? "..." : "Approve"}
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
