"use server";

import { verifyLendingRole, verifyLendingLicense } from "@/app/lib/roles";
import { LoanService } from "@/app/services/all/lending/loan";

export async function getLoans(page = 1, limit = 20, filters: any = {}) {
    if (!await verifyLendingRole()) {
        if (!await verifyLendingLicense()) return { data: [], total: 0, error: "Company must be a registered Credit Provider." };
        return { data: [], total: 0, error: "Unauthorized" };
    }

    try {
        const result = await LoanService.getList(page, limit, filters);
        return {
            data: result.data,
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    } catch (e) {
        console.error("Failed to fetch Loans", e);
        return { data: [], total: 0, error: "Failed to fetch loans" };
    }
}

export async function getLoan(id: string) {
    if (!await verifyLendingRole()) {
        if (!await verifyLendingLicense()) return { data: null, error: "Company must be a registered Credit Provider." };
        return { data: null, error: "Unauthorized" };
    }

    try {
        const data = await LoanService.get(id);
        return { data };
    } catch (e) {
        return { data: null, error: "Failed to fetch Loan" };
    }
}

export async function getLoanRepaymentSchedule(loanId: string) {
    if (!await verifyLendingRole()) return [];

    try {
        return await LoanService.getRepaymentSchedule(loanId);
    } catch (e) {
        return [];
    }
}

export async function getAssetAccounts(company: string) {
    if (!await verifyLendingRole()) return [];

    try {
        return await LoanService.getAssetAccounts(company);
    } catch (e) {
        console.error("Failed to fetch Asset Accounts", e);
        return [];
    }
}

export async function realisePawnAsset({ loan, asset_account }: { loan: string, asset_account: string }) {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };

    try {
        const message = await LoanService.realisePawnAsset(loan, asset_account);
        return { success: true, message };
    } catch (e: any) {
        console.error("Asset Realisation Failed", e);
        return { success: false, error: e.message || "Failed to realise asset" };
    }
}

export async function disburseLoan({ loanId, postingDate }: { loanId: string, postingDate?: string }) {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };

    try {
        const message = await LoanService.disburse(loanId, postingDate);
        return { success: true, message };
    } catch (e: any) {
        console.error("Disbursement Failed", e);
        return { success: false, error: e.message || "Failed to disburse loan" };
    }
}

export async function releaseSecurity({ loanId }: { loanId: string }) {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };
    try {
        const message = await LoanService.releaseSecurity(loanId);
        return { success: true, message };
    } catch (e: any) {
        console.error("Release Failed", e);
        return { success: false, error: e.message || "Failed to release security" };
    }
}

export async function getLoanTimeline(loanId: string) {
    if (!await verifyLendingRole()) return [];

    try {
        return await LoanService.getTimeline(loanId);
    } catch (e) {
        console.error("Failed to fetch Timeline", e);
        return [];
    }
}
