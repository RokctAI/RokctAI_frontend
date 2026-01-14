"use server";

import { PaymentService } from "@/app/services/all/accounting/payments";

export async function getPayment(name: string) {
    try {
        const result = await PaymentService.get(name);
        return result;
    } catch (e) {
        console.error(`Failed to fetch Payment ${name}`, e);
        return null;
    }
}
