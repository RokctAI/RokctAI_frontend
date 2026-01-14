"use server";

import { revalidatePath } from "next/cache";
import { AssetMaintenanceService } from "@/app/services/all/accounting/assets";
import { AssetMaintenanceData } from "./types";

export async function createAssetMaintenance(data: AssetMaintenanceData) {
    try {
        const response = await AssetMaintenanceService.create(data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error("Failed to create Asset Maintenance", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
