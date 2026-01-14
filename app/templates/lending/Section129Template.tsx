
import React from 'react';

interface Section129TemplateProps {
    app: any;
    company: any;
    date: string;
}

export const Section129Template: React.FC<Section129TemplateProps> = ({ app, company, date }) => {
    return (
        <div className="bg-white p-12 shadow-lg border border-gray-200 font-serif text-justify leading-relaxed print:shadow-none print:border-none print:p-0">
            <div className="text-center font-bold uppercase mb-8 underline text-xl">
                Notice in terms of Section 129(1) of the National Credit Act 34 of 2005
            </div>

            <div className="mb-8">
                <p><strong>Date:</strong> {date}</p>
                <p><strong>To:</strong> {app?.applicant}</p>
                <p><strong>Account Ref:</strong> {app?.name}</p>
            </div>

            <p className="mb-4">
                We refer to the credit agreement entered into between yourself and <span className="font-bold">{company?.companyName || "the Credit Provider"}</span>.
            </p>

            <p className="mb-4 text-red-600 font-bold bg-red-50 p-2 border border-red-200 print:border-none print:bg-transparent print:text-black">
                You are currently in default under the credit agreement.
            </p>

            <p className="mb-4">
                We hereby advise you that you have the right to:
            </p>

            <ul className="list-disc pl-8 mb-6 space-y-2">
                <li>Refer the credit agreement to a debt counsellor;</li>
                <li>Refer the matter to an alternative dispute resolution agent;</li>
                <li>Refer the matter to the Consumer Court; or</li>
                <li>Refer the matter to the Ombud with jurisdiction;</li>
            </ul>

            <p className="mb-4">
                with the intent that the parties resolve any dispute under the agreement or develop and agree on a plan to bring the payments under the agreement up to date.
            </p>

            <p className="mb-8">
                <strong>Failure to respond:</strong> Please take note that if you do not respond to this notice or reject our proposals within 10 business days from delivery of this notice, we may approach the court for an order to enforce the credit agreement.
            </p>

            <div className="mt-16">
                <p>Yours faithfully,</p>
                <p className="font-bold mt-4">{company?.companyName}</p>
                <p>Collections Department</p>
            </div>
        </div>
    );
};
