"use client";

import React, { useState } from 'react';

interface ResignationProps {
    onConfirm?: (data: any) => void;
    onCancel?: () => void;
}

export function ResignationConfirmation({ onConfirm, onCancel }: ResignationProps) {
    const [reason, setReason] = useState("");
    const [lwd, setLwd] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        if (onConfirm) {
            onConfirm({ reason, last_working_day: lwd });
        } else {
            // Fallback direct call
            const { submitResignation } = await import("@/app/actions/ai/hr");
            await submitResignation({ reason, last_working_day: lwd });
            setIsConfirmed(true);
        }
        setIsSubmitting(false);
    };

    if (isConfirmed) {
        return (
            <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 w-full max-w-sm text-sm text-white">
                <h3 className="font-bold text-red-500 mb-2">Resignation Submitted</h3>
                <p className="text-zinc-400">Your resignation has been filed. HR will be in touch shortly.</p>
            </div>
        )
    }

    return (
        <div className="bg-zinc-900 border border-red-900/50 rounded-lg p-4 w-full max-w-sm text-sm text-white space-y-3">
            <h3 className="font-bold text-lg text-red-500">⚠️ Resignation</h3>
            <p className="text-zinc-400 text-xs">
                Are you sure you want to resign? This action will initiate your separation process.
            </p>

            <div className="space-y-1">
                <label className="text-xs text-zinc-400">Proposed Last Working Day</label>
                <input
                    type="date"
                    value={lwd}
                    onChange={e => setLwd(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs text-zinc-400">Reason (Optional)</label>
                <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 h-16 resize-none"
                    placeholder="I have decided to move on..."
                />
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    onClick={onCancel}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded py-2"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !lwd}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded py-2 font-medium"
                >
                    {isSubmitting ? "Submitting..." : "Confirm Resignation"}
                </button>
            </div>
        </div>
    );
}
