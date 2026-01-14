"use server";

import { revalidatePath } from "next/cache";
// import { applyGlobalWorkflows } from "@/app/actions/handson/control/workflows";
import { InvoiceService } from "@/app/services/all/accounting/invoices";
import { InvoiceData } from "./types";

export async function createInvoice(data: InvoiceData) {
    try {
        // 1. Apply Global Workflow Rules (Blocks or Modifies)
        // const finalData = await applyGlobalWorkflows("Sales Invoice", data);
        const finalData = data; // Bypass workflow for now as function is missing

        const response = await InvoiceService.create(finalData);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error("Failed to create Invoice", e);
        const msg = e.message?.includes("[Workflow Block]") ? e.message.replace("Error: ", "") : (e?.message || "Unknown error");
        return { success: false, error: msg };
    }
}
