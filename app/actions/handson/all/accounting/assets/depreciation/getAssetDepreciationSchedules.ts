"use server";

import { AssetDepreciationService } from "@/app/services/all/accounting/assets";

export async function getAssetDepreciationSchedules() {
    try {
        const list = await AssetDepreciationService.getList();
        return list;
    } catch (e) {
        console.error("Failed to fetch Asset Depreciation Schedules", e);
        return [];
    }
}
