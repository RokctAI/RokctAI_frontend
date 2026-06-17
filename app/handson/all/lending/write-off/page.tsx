"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoan } from "@/app/actions/handson/all/lending/loan";
import { createLoanWriteOff } from "@/app/actions/handson/all/lending/lifecycle";
import { getSessionCurrency } from "@/app/actions/currency";
import { toast } from "sonner";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import t from "@/app/lib/i18n";

export default function WriteOffPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loanId = searchParams.get("loan");

  const [loan, setLoan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currency, setCurrency] = useState("ZAR");

  useEffect(() => {
    getSessionCurrency().then((c) => setCurrency(c));
  }, []);

  useEffect(() => {
    if (loanId) {
      getLoan(loanId).then((res) => {
        setLoan(res.data);
        setIsLoading(false);
      });
    }
  }, [loanId]);

  const handleWriteOff = async () => {
    if (
      !confirm(
        t('app.lending.write_off_confirm'),
      )
    )
      return;

    setIsSubmitting(true);
    const outstanding =
      (loan.loan_amount || 0) - (loan.total_principal_paid || 0);

    const res = await createLoanWriteOff(loan.name, outstanding);

    if (res.success) {
      toast.success(t('app.lending.write_off_success'));
      router.push(`/handson/all/lending/loan/${loan.name}`);
    } else {
      toast.error(res.error || t('app.lending.write_off_failed'));
    }
    setIsSubmitting(false);
  };

  if (isLoading)
    return <div className="p-12 text-center text-gray-500">{t('common.loading')}</div>;
  if (!loan)
    return <div className="p-12 text-center text-red-500">{t('common.not_found')}</div>;

  const outstanding =
    (loan.loan_amount || 0) - (loan.total_principal_paid || 0);

  return (
    <div className="max-w-xl mx-auto py-12">
        <Link
          href={`/handson/all/lending/loan/${loan.name}`}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {t('common.back')}
        </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
        <div className="p-6 bg-red-50 border-b border-red-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
           <div>
             <h1 className="text-xl font-bold text-red-900">
               {t('app.lending.write_off_title')}
             </h1>
             <p className="text-red-700 text-sm">
               {t('app.lending.write_off_desc', { loan: loan.name, applicant: loan.applicant })}
             </p>
           </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl space-y-2">
             <div className="flex justify-between text-sm">
               <span className="text-gray-500">{t('common.total_sanctioned')}</span>
               <span className="font-medium">{loan.loan_amount}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-gray-500">{t('common.total_paid')}</span>
               <span className="font-medium text-emerald-600">
                 {loan.total_principal_paid}
               </span>
             </div>
             <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-lg">
               <span>{t('common.outstanding_principal')}</span>
               <span>
                 {new Intl.NumberFormat("en-ZA", {
                   style: "currency",
                   currency: currency,
                 }).format(outstanding)}
               </span>
             </div>
             <p className="text-xs text-gray-400 mt-2">
               {t('app.lending.write_off_interest_note')}
             </p>
          </div>

          <div className="space-y-4">
             <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100">
               <strong>{t('common.please_note')}</strong> {t('app.lending.write_off_note')}
             </div>

             <button
               onClick={handleWriteOff}
               disabled={isSubmitting}
               className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center disable:opacity-50"
             >
               {isSubmitting ? t('common.posting') : t('app.lending.confirm_write_off')}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
