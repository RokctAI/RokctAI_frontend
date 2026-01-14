"use server";

import { revalidatePath } from "next/cache";
import { AssetRepairService } from "@/app/services/all/accounting/assets";

export async function createAssetRepair(data: { asset: string; failure_date: string; description: string; total_repair_cost: number }) {
    try {
        const response = await AssetRepairService.create(data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
