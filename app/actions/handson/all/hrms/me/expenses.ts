"use server";

import { revalidatePath } from "next/cache";
import { getCurrentEmployeeId } from "@/app/lib/roles";
import { ExpenseService } from "@/app/services/all/hrms/expenses";
import type { ExpenseClaimData } from "@/app/services/all/hrms/expenses";

export type { ExpenseClaimData };

export async function getMyExpenseClaims() {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return [];

    try {
        return await ExpenseService.getClaims({ employee: employeeId });
    } catch (e) {
        return [];
    }
}

export async function createMyExpenseClaim(data: ExpenseClaimData) {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return { success: false, error: "Employee record not found" };

    try {
        const result = await ExpenseService.createClaim({
            ...data,
            employee: employeeId
        });
        revalidatePath("/handson/all/hrms/me/expenses");
        return { success: true, message: "Expense Claim created", name: result.name };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to create Expense Claim" };
    }
}
