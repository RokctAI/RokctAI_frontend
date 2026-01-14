"use server";

import { verifyLendingRole } from "@/app/lib/roles";
import { OperationsService } from "@/app/services/all/lending/operations";

export async function triggerLoanInterestAccrual(postingDate?: string) {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };

    try {
        const message = await OperationsService.triggerInterestAccrual(postingDate);
        return { success: true, message: `Interest Accrual Processed: ${message}` };
    } catch (e: any) {
        console.error("Interest Accrual Failed", e);
        return { success: false, error: e.message || "Failed to trigger interest accrual" };
    }
}

export async function triggerLoanSecurityShortfall() {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };

    try {
        await OperationsService.triggerSecurityShortfall();
        return { success: true, message: "Security Shortfall Check Initiated" };
    } catch (e: any) {
        console.error("Shortfall Check Failed", e);
        return { success: false, error: e.message || "Failed to trigger shortfall check" };
    }
}

export async function triggerLoanClassification() {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };

    try {
        await OperationsService.triggerClassification();
        return { success: true, message: "Loan Classification Process Initiated" };
    } catch (e: any) {
        console.error("Classification Failed", e);
        return { success: false, error: e.message || "Failed to trigger classification" };
    }
}

export async function getProcessLogs(limit = 10) {
    if (!await verifyLendingRole()) return [];
    try {
        return await OperationsService.getProcessLogs(limit);
    } catch (e) {
        console.error("Failed to fetch logs", e);
        return [];
    }
}
