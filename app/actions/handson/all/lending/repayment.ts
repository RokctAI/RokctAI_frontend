"use server";

import { revalidatePath } from "next/cache";
import { verifyLendingRole, verifyLendingLicense } from "@/app/lib/roles";
import { z } from "zod";
import { RepaymentService } from "@/app/services/all/lending/repayment";

const RepaymentSchema = z.object({
    against_loan: z.string().min(1, "Loan reference is required"),
    posting_date: z.string().min(1, "Posting Date is required"),
    amount_paid: z.number().positive("Amount must be positive"),
    company: z.string().min(1, "Company is required")
});

export type RepaymentData = z.infer<typeof RepaymentSchema>;

export async function getLoanRepayments(page = 1, limit = 20) {
    if (!await verifyLendingRole()) {
        if (!await verifyLendingLicense()) return { data: [], total: 0, error: "Company must be a registered Credit Provider." };
        return { data: [], total: 0, error: "Unauthorized" };
    }

    try {
        const result = await RepaymentService.getList(page, limit);
        return {
            data: result.data,
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    } catch (e) {
        console.error("Failed to fetch Repayments", e);
        return { data: [], total: 0, error: "Failed to fetch repayment history" };
    }
}

export async function createLoanRepayment(data: RepaymentData) {
    if (!await verifyLendingRole()) {
        if (!await verifyLendingLicense()) return { success: false, error: "Company must be a registered Credit Provider." };
        return { success: false, error: "Unauthorized" };
    }

    const validation = RepaymentSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    try {
        const response = await RepaymentService.create(data);
        revalidatePath("/handson/all/lending/repayment");
        revalidatePath(`/handson/all/lending/loan/${data.against_loan}`);
        return { success: true, message: response };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error creating repayment" };
    }
}
