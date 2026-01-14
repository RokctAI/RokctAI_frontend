"use server";

import { AssetRepairService } from "@/app/services/all/accounting/assets";

export async function getAssetRepairs() {
    try {
        const list = await AssetRepairService.getList();
        return list;
    } catch (e) { return []; }
}
