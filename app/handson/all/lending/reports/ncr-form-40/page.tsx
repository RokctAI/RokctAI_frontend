"use client";

import React, { useState, useEffect } from "react";
import {
  getNCRForm40Data,
  NCRForm40Data,
} from "@/app/actions/handson/all/lending/ncr_reports";
import { getSessionCurrency } from "@/app/actions/currency";
import {
  Loader2,
  AlertCircle,
  Printer,
  Download,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import t from "@/app/lib/i18n";

export default function NCRForm40Page() {
  const [data, setData] = useState<NCRForm40Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState("ZAR");

  useEffect(() => {
    loadData();
    getSessionCurrency().then((c) => setCurrency(c));
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await getNCRForm40Data({});
    if (res.error) {
      setError(res.error);
      toast.error(res.error);
    } else {
      setData(res.data);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    const reg63Desc = (
    <span className="flex items-center">
      {t('app.lending.ncr_form_40.checklist_reg_63')}
      <Link
        href="/handson/all/lending/reports/compliance-report"
        className="ml-2 underline text-blue-600 hover:text-blue-800 font-semibold"
      >
        {t('app.lending.fill_report')}
      </Link>
    </span>
  );
  const assuranceDesc = (
    <span className="flex items-center">
      {t('app.lending.ncr_form_40.checklist_assurance_desc')}
      <Link
        href="/handson/all/lending/reports/assurance-report"
        className="ml-2 underline text-blue-600 hover:text-blue-800 font-semibold"
      >
        {t('app.lending.generate_draft')}
      </Link>
    </span>
  );

  return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex items-center space-x-3 text-red-800">
        <AlertCircle className="w-6 h-6" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 print:p-0 print:max-w-none">
      {/* Header - No Print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <Link
            href="/handson/all/lending/reports"
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
           <div>
             <h1 className="text-2xl font-bold text-gray-900">
               {t('app.lending.ncr_form_40_title')}
             </h1>
             <p className="text-sm text-gray-500">
               {t('app.lending.ncr_form_40_desc')}
             </p>
           </div>
        </div>
        <div className="flex space-x-3">
           <button
             onClick={handlePrint}
             className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
           >
             <Printer className="w-4 h-4" />
             <span>{t('common.print_report')}</span>
           </button>
           {/* Placeholder for CSV Export */}
           <button
             disabled
             className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed"
           >
             <Download className="w-4 h-4" />
             <span>{t('app.lending.export_csv_soon')}</span>
           </button>
        </div>
      </div>

      {/* Compliance Note */}
       <div className="bg-blue-50 border-l-4 border-blue-500 p-4 print:hidden">
         <p className="text-sm text-blue-700">
           <strong>{t('common.note')} to Accounting Officer:</strong> {t('app.lending.ncr_form_40_note')}
         </p>
       </div>

      {/* The "Form" View */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden print:border-none print:shadow-none">
         <div className="p-8 border-b border-gray-100 bg-gray-50/50 print:bg-white print:border-b-2 print:border-black">
           <h2 className="text-xl font-bold text-gray-900 text-center uppercase tracking-wide">
             {t('app.lending.ncr_form_40_form_title')}
           </h2>
           <p className="text-center text-gray-500 text-sm mt-1">
             {t('app.lending.ncr_form_40_form_subtitle')}
           </p>
         </div>

        <div className="p-8 space-y-10">
          {/* SECTION 1: INCOME STATEMENT */}
           <section>
             <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
               {t('app.lending.ncr_form_40.income_statement_title')}
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
               <ReportRow
                 label={t('app.lending.ncr_form_40.interest_income')}
                 value={data?.income_statement.revenue.interest_income_nca}
                 currency={currency}
               />
               <ReportRow
                 label={t('app.lending.ncr_form_40.initiation_fees')}
                 value={data?.income_statement.revenue.initiation_service_fees}
                 currency={currency}
               />
               <ReportRow
                 label={t('app.lending.ncr_form_40.service_fees')}
                 value={data?.income_statement.revenue.initiation_service_fees}
                 currency={currency}
               />
               {/* Simplified mapping since API returns combined */}
               <div className="border-t border-gray-100 my-2 col-span-2"></div>
               <ReportRow
                 label={t('app.lending.ncr_form_40.less_bad_debts')}
                 value={data?.income_statement.expenses.bad_debt_write_offs}
                 isNegative
                 currency={currency}
               />
               <div className="border-t border-black my-2 col-span-2"></div>
               <ReportRow
                 label={t('app.lending.ncr_form_40.total_revenue')}
                 value={data?.income_statement.revenue.total_revenue}
                 bold
                 currency={currency}
               />
             </div>
           </section>

          {/* SECTION 2: BALANCE SHEET */}
           <section>
             <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
               {t('app.lending.ncr_form_40.balance_sheet_title')}
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
               <ReportRow
                 label={t('app.lending.ncr_form_40.gross_debtors')}
                 value={data?.balance_sheet.gross_debtors}
                 currency={currency}
               />
               <ReportRow
                 label={t('app.lending.ncr_form_40.less_provision')}
                 value={data?.balance_sheet.provision_bad_debt}
                 isNegative
                 currency={currency}
               />
               <div className="border-t border-black my-2 col-span-2"></div>
               <ReportRow
                 label={t('app.lending.ncr_form_40.net_debtors')}
                 value={data?.balance_sheet.net_debtors}
                 bold
                 currency={currency}
               />
             </div>
           </section>

          {/* SECTION 3: OPERATIONAL IS REPLACED BY PAGE 3 & 4 */}
        </div>

        {/* PAGE 3: BEE & EMPLOYMENT */}
         <div className="p-8 space-y-8 print:break-before-page">
           <div className="border-b-2 border-black pb-4 mb-6">
             <div className="flex justify-between items-end">
               <div>
                 <h1 className="text-xl font-bold uppercase">
                   {t('app.lending.ncr_form_40.bee_employment_title')}
                 </h1>
                 <p>{t('app.lending.ncr_form_40.page_3')}</p>
               </div>
             </div>
           </div>

          {/* Section 12: BEE */}
           <section>
             <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase">
               {t('app.lending.ncr_form_40.bee_title')}
             </h3>
             <p className="text-sm text-gray-600 mb-4">
               {t('app.lending.ncr_form_40.bee_desc')}
             </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <ReportRow
                   label={t('app.lending.ncr_form_40.historically_doubtful')}
                   value={data?.bee.hdp_ownership_percent}
                   isCurrency={false}
                   suffix="%"
                 />
                 <ReportRow
                   label={t('common.other')}
                   value={data?.bee.other_ownership_percent}
                   isCurrency={false}
                   suffix="%"
                 />
               </div>
               <div className="space-y-4 text-sm text-gray-500 italic border border-dashed border-gray-300 p-4 rounded">
                 <p>{t('app.lending.ncr_form_40.bee_commitments')}</p>
                 <div className="h-6 border-b border-gray-300"></div>
                 <div className="h-6 border-b border-gray-300"></div>
               </div>
             </div>
           </section>

          {/* Section 13: Employment */}
           <section>
             <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase mt-8">
               {t('app.lending.ncr_form_40.employment_title')}
             </h3>
             
             <div className="mb-6 space-y-2">
               <div className="flex justify-between items-center text-sm border-b border-gray-100 py-2">
                 <span>
                   {t('app.lending.ncr_form_40.employment_equity_plan')}
                 </span>
                 <div className="flex space-x-4 font-bold">
                   <span>{t('common.yes')}</span> / <span>{t('common.no')}</span>
                 </div>
               </div>
             </div>
             
             <h4 className="font-semibold text-gray-600 mb-2">
               {t('app.lending.ncr_form_40.employment_records_title')}
             </h4>
             <div className="space-y-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
               <ReportRow
                 label={t('app.lending.ncr_form_40.total_number_accounts')}
                 value={data?.employment.total_employees}
                 isCurrency={false}
               />
               <ReportRow
                 label={t('app.lending.ncr_form_40.hdp_accounts')}
                 value={data?.employment.hdp_employees}
                 isCurrency={false}
               />
               <ReportRow
                 label={t('app.lending.ncr_form_40.percentage_hdp')}
                 value={data?.employment.hdp_percent}
                 isCurrency={false}
                 suffix="%"
               />
             </div>
           </section>
        </div>

        {/* PAGE 4: DECLARATION */}
         <div className="p-8 space-y-8 bg-gray-50/30 print:bg-white print:break-before-page">
           <div className="border-b-2 border-black pb-4 mb-6">
             <div className="flex justify-between items-end">
               <div>
                 <h1 className="text-xl font-bold uppercase">
                   {t('app.lending.ncr_form_40.declaration_title')}
                 </h1>
                 <p>{t('app.lending.ncr_form_40.page_4')}</p>
               </div>
             </div>
           </div>

           <section className="space-y-6">
             <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase">
               {t('app.lending.ncr_form_40.declaration_header')}
             </h3>
             <div className="bg-blue-50 p-6 rounded-lg text-sm text-gray-700 space-y-4 border border-blue-100">
               <p className="italic">
                 "{t('app.lending.ncr_form_40.declaration_text')}"
               </p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
               <div className="space-y-6">
                 <div className="border-b border-gray-400 pb-1">
                   <span className="text-xs text-gray-400 block mb-1">
                     {t('app.lending.ncr_form_40.officer_name')}
                   </span>
                   <div className="h-6"></div>
                 </div>
                 <div className="border-b border-gray-400 pb-1">
                   <span className="text-xs text-gray-400 block mb-1">
                     {t('app.lending.ncr_form_40.professional_body')}
                   </span>
                   <div className="h-6"></div>
                 </div>
                 <div className="border-b border-gray-400 pb-1">
                   <span className="text-xs text-gray-400 block mb-1">
                     {t('app.lending.ncr_form_40.registration_number')}
                   </span>
                   <div className="h-6"></div>
                 </div>
               </div>
               <div className="space-y-6">
                 <div className="border-b border-gray-400 pb-1">
                   <span className="text-xs text-gray-400 block mb-1">
                     {t('common.signature')}
                   </span>
                   <div className="h-6"></div>
                 </div>
                 <div className="border-b border-gray-400 pb-1">
                   <span className="text-xs text-gray-400 block mb-1">
                     {t('common.date')}
                   </span>
                   <div className="h-6"></div>
                 </div>
               </div>
             </div>
           </section>
        </div>

        {/* REGULATORY CHECKLIST (Helper for User) */}
         <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6 print:hidden">
           <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
             <AlertCircle className="w-5 h-5 mr-2" />
             {t('app.lending.ncr_form_40.checklist_title')}
           </h3>
           <p className="text-sm text-indigo-800 mb-6">
             {t('app.lending.ncr_form_40.checklist_desc')}
           </p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <ChecklistItem
               label={t('app.lending.ncr_form_40.checklist_form_40')}
               desc={t('app.lending.ncr_form_40.checklist_form_40_desc')}
               completed={true}
             />
             <ChecklistItem
               label={t('app.lending.ncr_form_40.checklist_afs')}
               desc={t('app.lending.ncr_form_40.checklist_afs_desc')}
               completed={false}
             />
             <ChecklistItem
               label={t('app.lending.ncr_form_40.checklist_compliance')}
               desc={t('app.lending.ncr_form_40.checklist_compliance_desc')}
               completed={false}
             />
             <ChecklistItem
               label={t('app.lending.ncr_form_40.checklist_reg_63')}
               desc={reg63Desc}
               completed={false}
             />
             <ChecklistItem
               label={t('app.lending.ncr_form_40.checklist_assurance')}
               desc={assuranceDesc}
               completed={false}
             />
           </div>
         </div>
       </div>

       <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-xs text-gray-400 text-center print:hidden">
         {t('app.lending.generated_by', { date: new Date().toLocaleDateString() })}
       </div>
     </div>
  );
}

function ChecklistItem({
  label,
  desc,
  completed,
}: {
  label: string;
  desc: string | React.ReactNode;
  completed: boolean;
}) {
  return (
    <div
      className={`flex items-start p-4 rounded-lg border ${completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}
    >
      <div
        className={`mt-0.5 mr-3 w-5 h-5 rounded border flex items-center justify-center ${completed ? "bg-green-500 border-green-500 text-white" : "border-gray-300"}`}
      >
        {completed && (
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 12 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 5L4.5 8.5L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div>
        <h4
          className={`text-sm font-semibold ${completed ? "text-green-900" : "text-gray-900"}`}
        >
          {label}
        </h4>
        <div
          className={`text-xs ${completed ? "text-green-700" : "text-gray-500"}`}
        >
          {desc}
        </div>
      </div>
  );
}

function ReportRow({
  label,
  value,
  isNegative = false,
  bold = false,
  isCurrency = true,
  suffix = "",
  currency = "ZAR",
}: any) {
  const displayValue = isCurrency
    ? new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: currency,
      }).format(value || 0)
    : value || 0;

  return (
    <div
      className={`flex justify-between items-center ${bold ? "font-bold text-gray-900 text-lg" : "text-gray-600"}`}
    >
      <span>{label}</span>
      <span className={isNegative ? "text-red-600" : ""}>
        {isNegative && "("}
        {displayValue}
        {suffix}
        {isNegative && ")"}
      </span>
    </div>
  );
}
