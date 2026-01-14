"use server";

import { AssetMaintenanceService } from "@/app/services/all/accounting/assets";

export async function getAssetMaintenances() {
    try {
        const list = await AssetMaintenanceService.getList();
        return list;
    } catch (e) {
        console.error("Failed to fetch Asset Maintenances", e);
        return [];
    }
}
