"use server";

import { InvoiceService } from "@/app/services/all/accounting/invoices";

export async function getSalesInvoices() {
    try {
        const list = await InvoiceService.getList();
        return list;
    } catch (e) {
        console.error("Failed to fetch Sales Invoices", e);
        return [];
    }
}
