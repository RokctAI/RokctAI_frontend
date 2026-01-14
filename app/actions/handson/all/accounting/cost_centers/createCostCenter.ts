"use server";

import { revalidatePath } from "next/cache";
import { CostCenterService } from "@/app/services/all/accounting/cost_centers";
import { CostCenterData } from "./types";

export async function createCostCenter(data: CostCenterData) {
    try {
        const response = await CostCenterService.create(data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error("Failed to create Cost Center", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
