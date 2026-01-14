"use server";

import { revalidatePath } from "next/cache";
import { AssetService } from "@/app/services/all/accounting/assets";

export async function deleteAsset(name: string) {
    try {
        await AssetService.delete(name);
        revalidatePath("/handson/all/accounting");
        return { success: true };
    } catch (e: any) {
        console.error(`Failed to delete Asset ${name}`, e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
