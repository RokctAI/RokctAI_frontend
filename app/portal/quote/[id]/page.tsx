"use client";

import React, { useState, useEffect } from "react";
import { getLoanApplication, updateLoanApplicationStatus } from "@/app/actions/handson/all/lending/application";
// import { uploadFile } from "@/app/actions/system"; // We would implement this
import { Loader2, Camera, CheckCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function QuoteAcceptancePage({ params }: { params: { id: string } }) {
    const [step, setStep] = useState<"review" | "selfie" | "success">("review");
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selfie, setSelfie] = useState<string | null>(null);

    useEffect(() => {
        getLoanApplication(params.id).then(res => {
            setApp(res.data);
            setLoading(false);
        });
    }, [params.id]);

    const handleSelfieCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelfie(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        // await uploadFile(selfie, "Selfie Signature for " + app.name);
        // await updateLoanApplicationStatus(app.name, "Quote Accepted");
        setTimeout(() => { // Simulate API calls
            setStep("success");
            setLoading(false);
        }, 2000);
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

    if (step === "success") return (
        <div className="h-screen flex flex-col items-center justify-center bg-green-50 p-6 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
            <h1 className="text-3xl font-bold text-green-900 mb-2">Quote Accepted!</h1>
            <p className="text-green-700 max-w-md">
                Thank you. We have received your "Selfie Signature" and verified your acceptance.
                Your loan is now being processed for final approval.
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white text-center">
                    <h1 className="text-xl font-bold">Secure Acceptance</h1>
                    <p className="text-blue-100 text-sm opacity-90">Loan Ref: {app?.name}</p>
                </div>

                <div className="p-6">
                    {step === "review" && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-lg font-bold text-gray-900">Review your Quote</h2>
                                <p className="text-sm text-gray-500">Please confirm the details below.</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Loan Amount</span>
                                    <span className="font-bold">R {app?.loan_amount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Period</span>
                                    <span className="font-bold">{app?.repayment_periods} Months</span>
                                </div>
                                {/* Add Interest/Installment here if data available */}
                            </div>

                            <button
                                onClick={() => setStep("selfie")}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                            >
                                Everything Looks Good
                            </button>
                        </div>
                    )}

                    {step === "selfie" && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-lg font-bold text-gray-900">Sign with a Selfie</h2>
                                <p className="text-sm text-gray-500">
                                    Take a photo of yourself to digitally sign this agreement.
                                </p>
                            </div>

                            <div className="relative aspect-square bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                {selfie ? (
                                    <img src={selfie} alt="Selfie" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <span className="text-xs">Tap below to capture</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="block w-full cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="user"
                                        onChange={handleSelfieCapture}
                                        className="hidden"
                                    />
                                    <div className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-800 transition">
                                        <Camera className="w-5 h-5" />
                                        <span>{selfie ? "Retake Photo" : "Take Selfie"}</span>
                                    </div>
                                </label>

                                {selfie && (
                                    <button
                                        onClick={handleConfirm}
                                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
                                    >
                                        Submit & Sign
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center mt-6 text-xs text-gray-400">
                <p>Secured by 256-bit Encryption</p>
                <p>IP Address & Device Verification Active</p>
            </div>
        </div>
    );
}
