"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createLoanTransfer,
  getBranches,
  getLoansByBranch,
} from "@/app/actions/handson/all/lending/transfer";
import { toast } from "sonner";
import { ArrowRightLeft, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import t from "@/app/lib/i18n";

export default function TransferPage() {
  const router = useRouter();

  const [branches, setBranches] = useState<{ name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [availableLoans, setAvailableLoans] = useState<any[]>([]);

  const [selectedLoans, setSelectedLoans] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getBranches().then((res) => {
      if (res.success) setBranches(res.data);
      setIsLoading(false);
    });
  }, []);

  const fetchLoans = async () => {
    if (!fromBranch) return;
    const res = await getLoansByBranch(fromBranch);
    if (res.success) {
      setAvailableLoans(res.data);
      setSelectedLoans([]); // Reset selection
    } else {
      toast.error("Failed to fetch loans");
    }
  };

  const toggleLoan = (loanName: string) => {
    if (selectedLoans.includes(loanName)) {
      setSelectedLoans(selectedLoans.filter((id) => id !== loanName));
    } else {
      setSelectedLoans([...selectedLoans, loanName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLoans.length === 0)
      return toast.error("Select at least one loan");
    if (fromBranch === toBranch)
      return toast.error("Source and Destination branches must be different");

    setIsSubmitting(true);
    // Assuming single company context for now, ideally fetch from first loan
    const res = await createLoanTransfer({
      transfer_date: date,
      from_branch: fromBranch,
      to_branch: toBranch,
      loans: selectedLoans,
      company: "Juvo", // Default or fetch
    });

    if (res.success) {
      toast.success(t('common.success') || "Transfer Successful");
      router.push("/handson/all/lending");
    } else {
      toast.error(res.error || t('common.failed') || "Transfer Failed");
    }
    setIsSubmitting(false);
  };

  if (isLoading)
    return (
      <div className="p-12 text-center text-gray-500">{t('common.loading')}</div>
    );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
         <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center">
             <ArrowRightLeft className="w-6 h-6 mr-2 text-indigo-600" />
             {t('app.lending.transfer_title')}
           </h1>
           <p className="text-gray-500">{t('app.lending.transfer_desc')}</p>
         </div>
         <Link
           href="/handson/all/lending"
           className="text-sm font-medium text-gray-600 hover:text-gray-900"
         >
           {t('common.cancel')}
         </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
             <h2 className="text-lg font-semibold mb-4 flex items-center">
               <Building2 className="w-5 h-5 mr-2 text-gray-400" />
               {t('app.lending.transfer_config')}
             </h2>

            <div className="space-y-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   {t('common.transfer_date')}
                 </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   {t('app.lending.from_branch')}
                 </label>
                <select
                  value={fromBranch}
                  onChange={(e) => {
                    setFromBranch(e.target.value);
                    setAvailableLoans([]);
                  }}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                >
                   <option value="">{t('app.lending.select_origin_branch')}</option>
                  {branches.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   {t('app.lending.to_branch')}
                 </label>
                <select
                  value={toBranch}
                  onChange={(e) => setToBranch(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 outline-none"
                >
                   <option value="">{t('app.lending.select_destination_branch')}</option>
                  {branches.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

                 <button
                   type="button"
                   onClick={fetchLoans}
                   disabled={!fromBranch}
                   className="w-full py-3 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
                 >
                   {t('app.lending.find_transferable_loans')}
                 </button>
            </div>
          </div>
        </div>

        {/* Selection Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
           <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
             <span>{t('app.lending.select_loans')}</span>
             {selectedLoans.length > 0 && (
               <span className="text-sm font-normal text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                 {t('common.selected_count', { count: selectedLoans.length })}
               </span>
             )}
           </h2>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
             {availableLoans.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400">
                 <ArrowRightLeft className="w-12 h-12 mb-3 opacity-20" />
                 <p>{t('app.lending.transfer_no_loans')}</p>
               </div>
             ) : (
              availableLoans.map((loan) => (
                <div
                  key={loan.name}
                  onClick={() => toggleLoan(loan.name)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedLoans.includes(loan.name)
                      ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{loan.name}</p>
                      <p className="text-sm text-gray-500">
                        {loan.applicant_name}
                      </p>
                    </div>
                    {selectedLoans.includes(loan.name) && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-400 font-mono">
                    Amount: {loan.loan_amount}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100">
             <button
               onClick={handleSubmit}
               disabled={isSubmitting || selectedLoans.length === 0 || !toBranch}
               className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50 flex justify-center"
             >
               {isSubmitting ? t('common.processing') : t('app.lending.confirm_transfer')}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
