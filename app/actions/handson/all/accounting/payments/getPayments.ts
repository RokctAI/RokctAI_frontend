"use server";

import { PaymentService } from "@/app/services/all/accounting/payments";

export async function getPayments() {
    try {
        const list = await PaymentService.getList();
        return list;
    } catch (e) {
        console.error("Failed to fetch Payment Entries", e);
        return [];
    }
}
