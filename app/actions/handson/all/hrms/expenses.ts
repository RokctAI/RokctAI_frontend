"use server";

import { revalidatePath } from "next/cache";
import { verifyHrRole } from "@/app/lib/roles";
import { ExpenseService, ExpenseClaimData } from "@/app/services/all/hrms/expenses";

export type { ExpenseClaimData };

export async function getExpenseClaimTypes() {
    if (!await verifyHrRole()) return [];
    try {
        return await ExpenseService.getClaimTypes();
    } catch (e) {
        return [];
    }
}

export async function getExpenseClaims() {
    if (!await verifyHrRole()) return [];
    try {
        return await ExpenseService.getClaims();
    } catch (e) {
        return [];
    }
}

export async function createExpenseClaim(data: ExpenseClaimData) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await ExpenseService.createClaim(data);
        revalidatePath("/handson/all/hrms/expenses");
        revalidatePath("/handson/all/hrms/me/expenses");
        return { success: true, message: "Expense Claim created", name: result.name };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to create Expense Claim" };
    }
}
