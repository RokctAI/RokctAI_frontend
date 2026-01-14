"use server";

import { revalidatePath } from "next/cache";
import { InvoiceService } from "@/app/services/all/accounting/invoices";

export async function deleteInvoice(name: string) {
    try {
        await InvoiceService.delete(name);
        revalidatePath("/handson/all/accounting");
        return { success: true };
    } catch (e: any) {
        console.error(`Failed to delete Invoice ${name}`, e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
