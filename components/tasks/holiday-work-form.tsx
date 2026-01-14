"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Users, User, Building } from "lucide-react";
import { announceHolidayWork } from "@/app/actions/ai/holiday";
import { getDepartments } from "@/app/actions/handson/all/hrms/departments";

interface HolidayWorkFormProps {
    holidayName: string;
    holidayDate: string;
}

export const HolidayWorkForm = ({ holidayName, holidayDate }: HolidayWorkFormProps) => {
    const [step, setStep] = useState<"confirm" | "audience" | "done">("confirm");
    const [audience, setAudience] = useState<"Me Only" | "All" | "Departments">("Me Only");
    const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
    const [availableDepts, setAvailableDepts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (step === "audience") {
            const fetchDepts = async () => {
                const depts = await getDepartments();
                setAvailableDepts(depts);
            };
            fetchDepts();
        }
    }, [step]);

    const handleConfirm = async () => {
        setLoading(true);
        const result = await announceHolidayWork({
            holiday: `${holidayName} (${holidayDate})`,
            audience,
            departments: selectedDepts
        });
        setLoading(false);
        if (result.success) {
            setStep("done");
        }
    };

    if (step === "done") {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                <Check className="w-5 h-5 inline mr-2" />
                Work schedule confirmed for {holidayName}.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm w-full max-w-md">
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Upcoming Holiday</span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{holidayName}</h3>
                <span className="text-sm text-zinc-500">{holidayDate}</span>
            </div>

            {step === "confirm" && (
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Are you working on this day?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStep("audience")}
                            className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 flex justify-center items-center gap-2"
                        >
                            <Check className="w-4 h-4" /> Yes
                        </button>
                        <button
                            onClick={() => setStep("done")} // Logic: If No, we effectively do nothing or log removal? For now treating as "Done"
                            className="flex-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 flex justify-center items-center gap-2"
                        >
                            <X className="w-4 h-4" /> No
                        </button>
                    </div>
                </div>
            )}

            {step === "audience" && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Who is working?</label>

                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: "Me Only", icon: User, label: "Me Only" },
                                { id: "All", icon: Users, label: "All Staff" },
                                { id: "Departments", icon: Building, label: "Depts" }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setAudience(opt.id as any)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-md border text-xs ${audience === opt.id
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                        : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                        }`}
                                >
                                    <opt.icon className="w-4 h-4" />
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {audience === "Departments" && (
                        <div className="flex flex-col gap-2 max-h-32 overflow-y-auto border p-2 rounded-md bg-zinc-50 dark:bg-zinc-900">
                            {availableDepts.length === 0 ? (
                                <span className="text-xs text-zinc-400">Loading departments...</span>
                            ) : (
                                availableDepts.map((dept: any) => (
                                    <label key={dept.name} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedDepts.includes(dept.department_name)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedDepts([...selectedDepts, dept.department_name]);
                                                } else {
                                                    setSelectedDepts(selectedDepts.filter(d => d !== dept.department_name));
                                                }
                                            }}
                                            className="rounded border-zinc-300"
                                        />
                                        {dept.department_name}
                                    </label>
                                ))
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleConfirm}
                        disabled={loading || (audience === "Departments" && selectedDepts.length === 0)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Confirming..." : "Confirm Schedule"}
                    </button>

                    <button
                        onClick={() => setStep("confirm")}
                        className="text-xs text-zinc-400 hover:text-zinc-600 text-center"
                    >
                        Back
                    </button>
                </div>
            )}
        </div>
    );
};
