"use server";

import { revalidatePath } from "next/cache";
import { verifyHrRole } from "@/app/lib/roles";
import { PromotionService } from "@/app/services/all/hrms/promotions";
import type { PromotionData } from "@/app/services/all/hrms/promotions";

export type { PromotionData };

export async function getPromotions() {
    try {
        return await PromotionService.getList();
    } catch (e) {
        console.error("Failed to fetch promotions", e);
        return [];
    }
}

export async function createPromotion(data: PromotionData) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await PromotionService.create(data);
        revalidatePath("/handson/all/hrms/personnel");
        return { success: true, message: "Promotion created", name: result.name };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to create promotion" };
    }
}
