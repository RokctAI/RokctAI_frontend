"use server";

import { PaymentService } from "@/app/services/all/accounting/payments";
import { JournalService } from "@/app/services/all/accounting/journals";
import { revalidatePath } from "next/cache";

export async function updateClearanceDate(doctype: "Payment Entry" | "Journal Entry", name: string, date: string) {
    try {
        let response;
        if (doctype === "Payment Entry") {
            response = await PaymentService.setClearanceDate(name, date);
        } else {
            response = await JournalService.setClearanceDate(name, date);
        }
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error(`Failed to update clearance date for ${name}`, e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
