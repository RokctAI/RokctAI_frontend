"use server";

import { revalidatePath } from "next/cache";
import { AssetMovementService } from "@/app/services/all/accounting/assets";

export async function createAssetMovement(data: { transaction_date: string; purpose: string; assets: { asset: string; target_location?: string }[] }) {
    try {
        const response = await AssetMovementService.create(data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
