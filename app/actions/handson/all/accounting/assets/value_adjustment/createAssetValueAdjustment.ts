"use server";

import { revalidatePath } from "next/cache";
import { AssetValueAdjustmentService } from "@/app/services/all/accounting/assets";
import { AssetValueAdjustmentData } from "./types";

export async function createAssetValueAdjustment(data: AssetValueAdjustmentData) {
    try {
        const response = await AssetValueAdjustmentService.create(data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error("Failed to create Asset Value Adjustment", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
