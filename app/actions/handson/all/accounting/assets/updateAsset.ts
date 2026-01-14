"use server";

import { revalidatePath } from "next/cache";
import { AssetService } from "@/app/services/all/accounting/assets";
import { AssetData } from "./types";

export async function updateAsset(name: string, data: Partial<AssetData>) {
    try {
        const response = await AssetService.update(name, data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error(`Failed to update Asset ${name}`, e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
