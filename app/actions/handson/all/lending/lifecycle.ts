"use server";

import { verifyLendingRole } from "@/app/lib/roles";
import { LifecycleService } from "@/app/services/all/lending/lifecycle";

export async function createLoanWriteOff(loan: string, amount: number) {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };

    try {
        const res = await LifecycleService.createLoanWriteOff(loan, amount);
        return { success: true, message: `Acc. ${loan} Written Off (${res.name})` };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function createLoanRestructure(data: {
    loan: string;
    date: string;
    reason?: string;
    // Simple restructure params (usually just modifying terms)
    new_term_months?: number;
    new_interest_rate?: number;
}) {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };
    try {
        const res = await LifecycleService.createLoanRestructure(data);
        return { success: true, message: `Loan Restructured (${res.name})` };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function createBalanceAdjustment(data: { loan: string; amount: number; type: "Debit Adjustment" | "Credit Adjustment"; remarks?: string }) {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };
    try {
        const res = await LifecycleService.createBalanceAdjustment(data);
        return { success: true, message: `Adjustment Posted (${res.name})` };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
