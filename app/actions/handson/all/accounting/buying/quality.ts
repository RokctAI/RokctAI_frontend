"use server";

import { BuyingService } from "@/app/services/all/accounting/buying";
import { revalidatePath } from "next/cache";

export async function getQualityInspections() {
    try {
        const res = await BuyingService.getQualityInspections();
        return res.data;
    } catch (e) { return []; }
}

export async function createQualityInspection(data: { inspection_type: string; reference_type: string; reference_name: string; status: string }) {
    try {
        const res = await BuyingService.createQualityInspection(data);
        revalidatePath("/handson/all/accounting/buying/quality");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
