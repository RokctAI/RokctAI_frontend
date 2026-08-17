/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import React, { useState, useEffect } from "react";
// import { uploadFile } from "@/app/actions/system"; // We would implement this
import { Loader2, Camera, CheckCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";

// STUB: `getLoanApplication`/`updateLoanApplicationStatus` used to come from
// `@/app/actions/handson/all/lending/application`, which was extracted into
// `polaris_sdk` (corporate/polaris/nextjs/). This page lives outside
// app/handson/all/lending/ so it wasn't part of that fork's file set and was
// missed. It needs the Polaris SDK installed (or this page moved into the
// SDK) before quote acceptance works again - see PR/report for details.
async function getLoanApplication(_id: string): Promise<{ data: any }> {
  throw new Error(
    "getLoanApplication is unavailable: lending actions were extracted to polaris_sdk and not yet reintegrated here."
  );
}

export default function QuoteAcceptancePage({
  params,
}: {
  params: { id: string };
}) {
  const [step, setStep] = useState<"review" | "selfie" | "success">("review");
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selfie, setSelfie] = useState<string | null>(null);

  useEffect(() => {
    getLoanApplication(params.id).then((res) => {
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
    setTimeout(() => {
      // Simulate API calls
      setStep("success");
      setLoading(false);
    }, 2000);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  if (step === "success")
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-green-50 p-6 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
         <h1 className="text-3xl font-bold text-green-900 mb-2">
           {t('app.portal.quote.success_title')}
         </h1>
         <p className="text-green-700 max-w-md">
           {t('app.portal.quote.success_desc')}
         </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
         <div className="bg-blue-600 p-6 text-white text-center">
           <h1 className="text-xl font-bold">{t('app.portal.quote.header_title')}</h1>
           <p className="text-blue-100 text-sm opacity-90">
             {t('app.portal.quote.header_ref', { ref: app?.name })}
           </p>
         </div>

        <div className="p-6">
          {step === "review" && (
            <div className="space-y-6">
               <div className="text-center space-y-2">
                 <h2 className="text-lg font-bold text-gray-900">
                   {t('app.portal.quote.review_title')}
                 </h2>
                 <p className="text-sm text-gray-500">
                   {t('app.portal.quote.review_desc')}
                 </p>
               </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-500">{t('app.portal.quote.label_amount')}</span>
                   <span className="font-bold">
                     R {app?.loan_amount?.toLocaleString()}
                   </span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-500">{t('app.portal.quote.label_period')}</span>
                   <span className="font-bold">
                     {app?.repayment_periods} {t('app.portal.quote.unit_months')}
                   </span>
                 </div>
                {/* Add Interest/Installment here if data available */}
              </div>

               <button
                 onClick={() => setStep("selfie")}
                 className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
               >
                 {t('app.portal.quote.btn_confirm')}
               </button>
            </div>
          )}

          {step === "selfie" && (
            <div className="space-y-6">
               <div className="text-center space-y-2">
                 <h2 className="text-lg font-bold text-gray-900">
                   {t('app.portal.quote.selfie_title')}
                 </h2>
                 <p className="text-sm text-gray-500">
                   {t('app.portal.quote.selfie_desc')}
                 </p>
               </div>

              <div className="relative aspect-square bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {selfie ? (
                  <img
                    src={selfie}
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                ) : (
                    <div className="text-center text-gray-400">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <span className="text-xs">{t('app.portal.quote.ph_capture')}</span>
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
                     <span>{selfie ? t('app.portal.quote.btn_retake') : t('app.portal.quote.btn_take_selfie')}</span>
                   </div>
                </label>

                {selfie && (
                   <button
                     onClick={handleConfirm}
                     className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
                   >
                     {t('app.portal.quote.btn_submit')}
                   </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

       <div className="text-center mt-6 text-xs text-gray-400">
         <p>{t('app.portal.quote.footer_encryption')}</p>
         <p>{t('app.portal.quote.footer_verification')}</p>
       </div>
    </div>
  );
}
