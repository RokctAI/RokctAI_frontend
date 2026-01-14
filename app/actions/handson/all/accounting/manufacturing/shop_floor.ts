"use server";

import { ManufacturingService } from "@/app/services/all/accounting/manufacturing";
import { revalidatePath } from "next/cache";

export interface ShopFloorData {
    doctype: "Workstation" | "Operation" | "Job Card" | "Downtime Entry";
    [key: string]: any;
}

export async function getShopFloorItems(doctype: string) {
    try {
        const res = await ManufacturingService.getShopFloorItems(doctype);
        return res.data;
    } catch (e) { return []; }
}

export async function createShopFloorItem(data: ShopFloorData) {
    try {
        const res = await ManufacturingService.createShopFloorItem(data);
        revalidatePath("/handson/all/accounting/manufacturing/shop-floor");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
