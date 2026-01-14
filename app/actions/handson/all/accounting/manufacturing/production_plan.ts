"use server";

import { ManufacturingService } from "@/app/services/all/accounting/manufacturing";
import { revalidatePath } from "next/cache";

export interface ProductionPlanData {
    company: string;
    posting_date: string;
    po_items: {
        item_code: string;
        planned_qty: number;
    }[];
}

export async function getProductionPlans() {
    try {
        const res = await ManufacturingService.getProductionPlans();
        return res.data;
    } catch (e) { return []; }
}

export async function createProductionPlan(data: ProductionPlanData) {
    try {
        const res = await ManufacturingService.createProductionPlan(data);
        revalidatePath("/handson/all/accounting/manufacturing/production-plan");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
