"use server";

import { verifyLendingRole } from "@/app/lib/roles";
import { TransferService } from "@/app/services/all/lending/transfer";

export async function createLoanTransfer(data: {
    transfer_date: string;
    from_branch: string;
    to_branch: string;
    loans: string[]; // List of Loan IDs
    company: string;
    applicant?: string;
}) {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };

    try {
        const message = await TransferService.create(data);
        return { success: true, message: `Transfer Successful (${message.name})` };
    } catch (e: any) {
        console.error("Loan Transfer Failed", e);
        return { success: false, error: e.message || "Failed to Transfer Loans" };
    }
}

export async function getLoansByBranch(branch: string, applicant?: string) {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await TransferService.getLoansByBranch(branch, applicant);
        return { success: true, data: result };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getBranches() {
    try {
        const result = await TransferService.getBranches();
        return { success: true, data: result };
    } catch (e) {
        return { success: false, data: [] };
    }
}
