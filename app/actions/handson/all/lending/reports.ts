"use server";

import { verifyLendingRole, verifyLendingLicense } from "@/app/lib/roles";
import { ReportService } from "@/app/services/all/lending/reports";

export async function getLendingReport(reportName: string, filters: any = {}) {
    if (!await verifyLendingRole()) {
        // Distinguish why failed
        if (!await verifyLendingLicense()) {
            return { columns: [], data: [], error: "Company must be a registered Credit Provider." };
        }
        return { columns: [], data: [], error: "Unauthorized" };
    }

    try {
        const result = await ReportService.getReport(reportName, filters);
        return {
            columns: result.columns,
            data: result.data,
            message: result.message
        };
    } catch (e: any) {
        console.error("Failed to fetch Report", e);
        return { columns: [], data: [], error: e?.message || "Failed to load report" };
    }
}
