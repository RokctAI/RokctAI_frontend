"use server";

import { revalidatePath } from "next/cache";
import { SeparationService } from "@/app/services/all/hrms/separations";

export async function createSeparation(data: any) {
    try {
        const result = await SeparationService.create(data);
        revalidatePath("/handson/all/hrms/personnel");
        return { success: true, message: result };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

export async function getSeparations() {
    try {
        return await SeparationService.getList();
    } catch (e) {
        console.error("Failed to fetch separations", e);
        return [];
    }
}
