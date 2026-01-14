"use server";

import { PurchaseService } from "@/app/services/all/accounting/purchases";

export async function getPurchaseInvoices() {
    try {
        const list = await PurchaseService.getList();
        return list;
    } catch (e) {
        console.error("Failed to fetch Purchase Invoices", e);
        return [];
    }
}
