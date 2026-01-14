"use server";

import { revalidatePath } from "next/cache";
import { PaymentService } from "@/app/services/all/accounting/payments";

export async function cancelPayment(name: string) {
    try {
        await PaymentService.cancel(name);
        revalidatePath("/handson/all/accounting");
        return { success: true };
    } catch (e: any) {
        console.error(`Failed to cancel Payment ${name}`, e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
