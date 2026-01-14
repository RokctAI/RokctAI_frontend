"use server";

import { AssetValueAdjustmentService } from "@/app/services/all/accounting/assets";

export async function getAssetValueAdjustments() {
    try {
        const list = await AssetValueAdjustmentService.getList();
        return list;
    } catch (e) {
        console.error("Failed to fetch Asset Value Adjustments", e);
        return [];
    }
}
