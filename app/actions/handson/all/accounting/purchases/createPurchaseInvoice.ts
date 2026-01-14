"use server";

import { revalidatePath } from "next/cache";
import { PurchaseService } from "@/app/services/all/accounting/purchases";
import { PurchaseInvoiceData } from "./types";

export async function createPurchaseInvoice(data: PurchaseInvoiceData) {
    try {
        const response = await PurchaseService.create(data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error("Failed to create Purchase Invoice", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
