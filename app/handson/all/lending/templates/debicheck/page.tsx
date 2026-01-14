"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Smartphone, Clock, ShieldCheck } from "lucide-react";

export default function DebiCheckPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8 p-6">

            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">DebiCheck</h1>
                <p className="text-lg font-medium text-gray-600">Take control of your debit orders</p>
            </div>

            {/* Introduction Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <p className="text-gray-700 leading-relaxed">
                    Thank you for setting up your debit order details. Your bank requires us to verify that you are in agreement with the details captured.
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
                    <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-800">
                        This means you will receive an SMS directly from your bank, to the mobile number you have registered with your bank.
                        The process is simple; just follow the instructions on your mobile.
                    </p>
                </div>
            </div>

            {/* Instructions Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">How to authorise:</h2>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                    <div className="p-6 flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0 font-bold text-gray-600">1</div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Check your phone</h3>
                            <p className="text-gray-600 text-sm">
                                You may either receive a <strong>USSD pop-up</strong> on your cell phone’s screen OR an <strong>SMS alerting you</strong> to authorise your DebiCheck debit order (depending on which bank manages your account).
                            </p>
                        </div>
                    </div>
                    <div className="p-6 flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0 font-bold text-gray-600">2</div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Authorise the mandate</h3>
                            <p className="text-gray-600 text-sm">
                                Follow the instructions in the notification to authorise your new debit order.
                            </p>
                        </div>
                    </div>
                    <div className="p-6 flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0 font-bold text-gray-600">3</div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Missed the notification?</h3>
                            <p className="text-gray-600 text-sm">
                                If you don’t receive the pop-up menu or the notification now, you can still continue with our application process.
                                Alternatively, you can visit your bank’s website for more information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timer / Expiry Warning */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 flex items-start space-x-4">
                <Clock className="w-6 h-6 text-orange-600 mt-0.5 shrink-0" />
                <div>
                    <h3 className="font-semibold text-orange-900">Deadline: 20:00 Tonight</h3>
                    <p className="text-sm text-orange-800 mt-1">
                        You will have until 20:00 this evening to approve the debit order on your cellphone or banking app.
                    </p>
                </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="bg-gray-50 rounded-xl p-6 text-xs text-gray-500 space-y-2">
                <p className="font-semibold text-gray-700">Please note:</p>
                <p>
                    We may make use of a Registered Mandate Service (RMS) in the case of a technical failure to deliver the notification or in the event of us not receiving a response after the mandate initiation for your authorisation has expired.
                </p>
                <p>
                    In these instances, you may receive a new notification from your bank to inform you of the successful registration of your DebiCheck mandate.
                </p>
            </div>
        </div>
    );
}
