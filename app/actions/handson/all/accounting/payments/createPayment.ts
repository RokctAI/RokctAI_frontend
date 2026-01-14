"use server";

import { revalidatePath } from "next/cache";
import { PaymentService } from "@/app/services/all/accounting/payments";
import { PaymentData } from "./types";

export async function createPayment(data: PaymentData) {
    try {
        const response = await PaymentService.create(data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error("Failed to create Payment Entry", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
