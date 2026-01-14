"use server";

import { AssetMovementService } from "@/app/services/all/accounting/assets";

export async function getAssetMovements() {
    try {
        const list = await AssetMovementService.getList();
        return list;
    } catch (e) { return []; }
}
