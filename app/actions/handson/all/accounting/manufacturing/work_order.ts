"use server";

import { ManufacturingService } from "@/app/services/all/accounting/manufacturing";
import { revalidatePath } from "next/cache";

export async function getWorkOrders() {
    try {
        const res = await ManufacturingService.getWorkOrders();
        return res.data;
    } catch (e) { return []; }
}

export async function getWorkOrder(id: string) {
    try {
        const res = await ManufacturingService.getWorkOrder(id);
        return res.data;
    } catch (e) { return null; }
}

export async function createWorkOrder(data: { production_item: string; qty: number; company: string; plan_start_date: string }) {
    try {
        const res = await ManufacturingService.createWorkOrder(data);
        revalidatePath("/handson/all/accounting/manufacturing/work-order");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
