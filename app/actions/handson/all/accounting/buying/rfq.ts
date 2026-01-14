"use server";

import { BuyingService } from "@/app/services/all/accounting/buying";
import { revalidatePath } from "next/cache";

export async function getRFQs() {
    try {
        const res = await BuyingService.getRFQs();
        return res.data;
    } catch (e) { return []; }
}

export async function createRFQ(data: { transaction_date: string; suppliers: { supplier: string }[]; items: { item_code: string; qty: number }[] }) {
    try {
        const res = await BuyingService.createRFQ(data);
        revalidatePath("/handson/all/accounting/buying/rfq");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
