"use server";

import { verifyLendingRole } from "@/app/lib/roles";
import { ProductService } from "@/app/services/all/lending/product";

export async function getLoanProducts() {
    // Note: Returns empty array on failure, handled by UI generic loading/empty state.
    // Ideally refactor to return { data, error } pattern later.
    if (!await verifyLendingRole()) return [];

    try {
        return await ProductService.getList();
    } catch (e) {
        console.error("Failed to fetch Loan Products", e);
        return [];
    }
}

export async function getLoanProduct(name: string) {
    if (!await verifyLendingRole()) return null;

    try {
        return await ProductService.get(name);
    } catch (e) {
        return null;
    }
}
