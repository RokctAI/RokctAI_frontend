"use server";

import { AssetService } from "@/app/services/all/accounting/assets";

export async function getAsset(name: string) {
    try {
        const result = await AssetService.get(name);
        return result;
    } catch (e) {
        console.error(`Failed to fetch Asset ${name}`, e);
        return null;
    }
}
