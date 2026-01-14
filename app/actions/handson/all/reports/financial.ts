"use server";

import { FinancialReportService, AccountData } from "@/app/services/all/reports/financial";
import { auth } from "@/auth";

export async function getAccountBalances(company: string) {
    const response = await FinancialReportService.getAccountBalances(company);
    return response || [];
}

export async function runFinancialReport(reportName: string, filters: any) {
    const session = await auth();
    const company = session?.user?.company?.name;

    if (!company) {
        throw new Error("No company context found in session");
    }

    // Force company filter
    const secureFilters = { ...filters, company: company };

    const response = await FinancialReportService.runFinancialReport(reportName, secureFilters);
    return response; // { result: [...], columns: [...] }
}
