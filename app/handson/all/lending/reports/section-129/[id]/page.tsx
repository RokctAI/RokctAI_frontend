"use client";

import React, { useEffect, useState } from "react";
import { getLoanApplication } from "@/app/actions/handson/all/lending/application";
import { getLendingLicenseDetails } from "@/app/lib/roles";
import { Section129Template } from "@/app/templates/lending/Section129Template";

// ... imports remain ...

export default function Section129Page({ params }: { params: { id: string } }) {
    // ... logic remains ...

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;

    const { app, company } = data;
    const date = new Date().toLocaleDateString();

    return (
        <div className="max-w-4xl mx-auto my-8">
            <div className="text-right mb-4 space-x-3 print:hidden">
                <button
                    onClick={() => toast.success(`Section 129 Notice sent to ${app?.applicant || "client"} via email.`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow-sm"
                >
                    <Mail className="w-4 h-4 inline mr-2" /> Send via Email
                </button>
                <button onClick={() => window.print()} className="bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition shadow-sm">
                    <Printer className="w-4 h-4 inline mr-2" /> Print Notice
                </button>
            </div>

            <Section129Template app={app} company={company} date={date} />
        </div>
    );
}
