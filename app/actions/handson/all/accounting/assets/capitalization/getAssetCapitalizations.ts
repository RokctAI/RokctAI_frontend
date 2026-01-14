"use server";

import { AssetCapitalizationService } from "@/app/services/all/accounting/assets";

export async function getAssetCapitalizations() {
    try {
        const list = await AssetCapitalizationService.getList();
        return list;
    } catch (e) { return []; }
}
