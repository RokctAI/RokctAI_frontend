"use server";

import { revalidatePath } from "next/cache";
import { AssetCapitalizationService } from "@/app/services/all/accounting/assets";

export async function createAssetCapitalization(data: { entry_type: string; target_asset?: string; posting_date: string; stock_items: { item_code: string; qty: number }[] }) {
    try {
        const response = await AssetCapitalizationService.create(data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
