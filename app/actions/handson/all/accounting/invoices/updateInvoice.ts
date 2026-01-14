"use server";

import { revalidatePath } from "next/cache";
import { InvoiceService } from "@/app/services/all/accounting/invoices";
import { InvoiceData } from "./types";

export async function updateInvoice(name: string, data: Partial<InvoiceData>) {
    try {
        const response = await InvoiceService.update(name, data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error(`Failed to update Invoice ${name}`, e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
