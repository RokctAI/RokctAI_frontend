"use server";

import { ManufacturingService } from "@/app/services/all/accounting/manufacturing";
import { revalidatePath } from "next/cache";

export async function getBOMs() {
    try {
        const res = await ManufacturingService.getBOMs();
        return res.data;
    } catch (e) { return []; }
}

export async function getBOM(name: string) {
    try {
        const res = await ManufacturingService.getBOM(name);
        return res.data;
    } catch (e) { return null; }
}

export async function createBOM(item: string, quantity: number, items: { item_code: string; qty: number }[]) {
    try {
        const res = await ManufacturingService.createBOM(item, quantity, items);
        revalidatePath("/handson/all/accounting/manufacturing/bom");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

export async function deleteBOM(name: string) {
    try {
        await ManufacturingService.deleteBOM(name);
        revalidatePath("/handson/all/accounting/manufacturing/bom");
        return { success: true };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
