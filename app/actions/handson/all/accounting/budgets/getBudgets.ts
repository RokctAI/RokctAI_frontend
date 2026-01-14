"use server";

import { BudgetService } from "@/app/services/all/accounting/budgets";

export async function getBudgets() {
    try {
        const list = await BudgetService.getList();
        return list;
    } catch (e) {
        console.error("Failed to fetch Budgets", e);
        return [];
    }
}
