"use server";

import { revalidatePath } from "next/cache";
import { BudgetService } from "@/app/services/all/accounting/budgets";
import { BudgetData } from "./types";

export async function createBudget(data: BudgetData) {
    try {
        const response = await BudgetService.create(data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error("Failed to create Budget", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
