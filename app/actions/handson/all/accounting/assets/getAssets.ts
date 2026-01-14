"use server";

import { AssetService } from "@/app/services/all/accounting/assets";

export async function getAssets() {
    try {
        const list = await AssetService.getList();
        return list;
    } catch (e) {
        console.error("Failed to fetch Assets", e);
        return [];
    }
}
