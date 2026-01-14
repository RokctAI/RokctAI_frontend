"use server";

import { BuyingService } from "@/app/services/all/accounting/buying";
import { revalidatePath } from "next/cache";

export interface PurchaseReceiptData {
    supplier: string;
    items: {
        item_code: string;
        qty: number;
        rate?: number;
    }[];
    posting_date?: string;
    company?: string;
}

export async function getPurchaseReceipts() {
    try {
        const res = await BuyingService.getPurchaseReceipts();
        return res.data;
    } catch (e) { return []; }
}

export async function createPurchaseReceipt(data: PurchaseReceiptData) {
    try {
        const res = await BuyingService.createPurchaseReceipt(data);
        revalidatePath("/handson/all/accounting/buying/receipt");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
