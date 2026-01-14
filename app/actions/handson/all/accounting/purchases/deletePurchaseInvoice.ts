"use server";

import { revalidatePath } from "next/cache";
import { PurchaseService } from "@/app/services/all/accounting/purchases";

export async function deletePurchaseInvoice(name: string) {
    try {
        await PurchaseService.delete(name);
        revalidatePath("/handson/all/accounting");
        return { success: true };
    } catch (e: any) {
        console.error(`Failed to delete Purchase Invoice ${name}`, e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
