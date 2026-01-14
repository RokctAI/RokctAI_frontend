"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';

interface LeaveApplicationProps {
    leave_type?: string;
    from_date?: string;
    to_date?: string;
    reason?: string;
    onApply?: (data: any) => void;
}

export function LeaveApplication({ leave_type = "Privilege Leave", from_date, to_date, reason, onApply }: LeaveApplicationProps) {
    const [formData, setFormData] = useState({
        leave_type,
        from_date: from_date || new Date().toISOString().split('T')[0],
        to_date: to_date || new Date().toISOString().split('T')[0],
        reason: reason || ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Call the AI action via prop or direct server action if needed
        // Here we assume the parent handles the actual submission or we call a server action
        if (onApply) {
            onApply(formData);
        } else {
            // Default behavior if not using AI tool callback directly
            try {
                // Dynamic import action
                const { applyAiLeave } = await import("@/app/actions/ai/hr");
                // Submit logic handled by AI Action wrapper
            } catch (e) {
                console.error(e);
            }
        }
        setIsSubmitting(false);
    };

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-full max-w-sm text-sm text-white space-y-3">
            <h3 className="font-bold text-lg text-blue-400">🌴 Apply for Leave</h3>

            <div className="space-y-1">
                <label className="text-xs text-zinc-400">Leave Type</label>
                <select
                    value={formData.leave_type}
                    onChange={e => setFormData({ ...formData, leave_type: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1"
                >
                    <option>Privilege Leave</option>
                    <option>Casual Leave</option>
                    <option>Sick Leave</option>
                    <option>Leave Without Pay</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs text-zinc-400">From</label>
                    <input
                        type="date"
                        value={formData.from_date}
                        onChange={e => setFormData({ ...formData, from_date: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-zinc-400">To</label>
                    <input
                        type="date"
                        value={formData.to_date}
                        onChange={e => setFormData({ ...formData, to_date: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs text-zinc-400">Reason</label>
                <textarea
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 h-16 resize-none"
                    placeholder="Taking a break..."
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 font-medium transition-colors"
            >
                {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
        </div>
    );
}
