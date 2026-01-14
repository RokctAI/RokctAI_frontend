"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getReceipts() {
    const frappe = await getPaaSClient();

    try {
        const receipts = await frappe.call({
            method: "paas.api.receipt.receipt.get_receipts",
            args: {
                limit_start: 0,
                limit_page_length: 100
            }
        });
        return receipts;
    } catch (error) {
        console.error("Failed to fetch receipts:", error);
        return [];
    }
}

export async function getReceiptDetails(id: string) {
    const frappe = await getPaaSClient();

    try {
        const receipt = await frappe.call({
            method: "paas.api.receipt.receipt.get_receipt",
            args: {
                id: id
            }
        });
        return receipt;
    } catch (error) {
        console.error("Failed to fetch receipt details:", error);
        throw error;
    }
}
