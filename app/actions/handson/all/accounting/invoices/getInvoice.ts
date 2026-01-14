"use server";

import { InvoiceService } from "@/app/services/all/accounting/invoices";

export async function getInvoice(name: string) {
    try {
        const result = await InvoiceService.get(name);
        return result;
    } catch (e) {
        console.error(`Failed to fetch Invoice ${name}`, e);
        return null;
    }
}
