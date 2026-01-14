
import React from 'react';

interface AssuranceReportTemplateProps {
    company: any;
    date: string;
    reportType: 'audited' | 'accounting_officer';
    yearEnd: string;
}

export const AssuranceReportTemplate: React.FC<AssuranceReportTemplateProps> = ({ company, date, reportType, yearEnd }) => {
    return (
        <div className="max-w-4xl mx-auto bg-white p-12 shadow-lg print:shadow-none print:p-0 font-serif text-justify border border-gray-200">
            {/* Disclaimer placeholder for Letterhead printing */}
            <div className="print:hidden bg-yellow-50 border border-yellow-200 p-4 mb-8 text-sm text-yellow-800 rounded">
                <strong>For Output:</strong> This document is designed to be printed on your Auditor&apos;s or Accounting Officer&apos;s official letterhead.
            </div>

            <div className="text-center font-bold uppercase mb-8 text-xl">
                {reportType === 'audited' ? 'Assurance Report (Audited)' : 'Assurance Report (Accounting Officer)'}
            </div>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <p><strong>To:</strong> The National Credit Regulator</p>
                    <p><strong>From:</strong> {company?.companyName || "Registrant Name"}</p>
                    <p><strong>NCR Registration No:</strong> {company?.licenseNumber || "NCRCPXXXX"}</p>
                    <p><strong>Date:</strong> {date}</p>
                </div>
            </div>

            <h2 className="font-bold text-lg mb-4 uppercase text-center">
                Compliance Report for the Year Ended {yearEnd}
            </h2>

            <p className="mb-4">
                We have performed the duties of {reportType === 'audited' ? 'auditor' : 'accounting officer'} for <strong>{company?.companyName}</strong> for the year ended <strong>{yearEnd}</strong> as required by Regulation 68 of the National Credit Act, 34 of 2005.
            </p>

            <h3 className="font-bold mb-2">Responsibility</h3>
            <p className="mb-4">
                The management of the registrant is responsible for compliance with the Act and Regulations. Our responsibility is to report on the registrant&apos;s compliance based on our engagement.
            </p>

            <h3 className="font-bold mb-2">Scope</h3>
            <p className="mb-4">
                We conducted our examination in accordance with the International Standards on Assurance Engagements (ISAE 3000). This standard requires that we comply with ethical requirements and plan and perform the assurance engagement to obtain reasonable assurance whether the registrant has complied with the Act.
            </p>

            {reportType === 'accounting_officer' && (
                <div className="mb-4 bg-blue-50 p-4 border-l-4 border-blue-500 text-sm italic print:bg-transparent print:border-none print:p-0 print:text-black">
                    <p><strong>Note for Accounting Officer:</strong> This report is based on the results of our duties as Accounting Officer, which are less extensive than a full audit.</p>
                </div>
            )}

            <h3 className="font-bold mb-2">Conclusion</h3>
            <p className="mb-8">
                Based on our work described in this report, in our opinion, the registrant <strong>HAS / HAS NOT (Delete whichever is not applicable)</strong> complied with the following sections of the Act:
            </p>

            <ul className="list-disc pl-8 mb-8 space-y-1">
                <li>Section 52 (Failed to register)</li>
                <li>Section 81 (Prevention of Reckless Credit)</li>
                <li>Section 92 (Pre-agreement disclosure)</li>
                <li>Section 93 (Form of credit agreement)</li>
                <li>Chapter 5, Part E (Interest and Fees)</li>
            </ul>

            <div className="mt-16 grid grid-cols-2 gap-12">
                <div>
                    <div className="border-b border-black h-8"></div>
                    <p className="mt-2 font-bold">{reportType === 'audited' ? 'Registered Auditor Signature' : 'Accounting Officer Signature'}</p>
                </div>
                <div>
                    <div className="border-b border-black h-8"></div>
                    <p className="mt-2 font-bold">Date</p>
                </div>
            </div>

            <div className="mt-8 space-y-1 text-sm">
                <p><strong>Name:</strong> _________________________________</p>
                <p><strong>Practice Number:</strong> _____________________</p>
                <p><strong>Professional Body:</strong> ______________________</p>
            </div>
        </div>
    );
};
