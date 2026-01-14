"use server";

import { revalidatePath } from "next/cache";
import { AssetService } from "@/app/services/all/accounting/assets";
import { AssetData } from "./types";

export async function createAsset(data: AssetData) {
    try {
        const response = await AssetService.create(data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error("Failed to create Asset", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
