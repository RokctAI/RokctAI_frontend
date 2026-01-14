"use server";

import { SellingService } from "@/app/services/all/accounting/selling";
import { revalidatePath } from "next/cache";
import { verifyCrmRole } from "@/app/lib/roles";

export interface DeliveryNoteData {
    customer: string;
    company: string;
    posting_date: string;
    items: {
        item_code: string;
        qty: number;
    }[];
}

export async function getDeliveryNotes() {
    if (!await verifyCrmRole()) return [];
    try {
        const res = await SellingService.getDeliveryNotes();
        return res.data;
    } catch (e) { return []; }
}

export async function getDeliveryNote(name: string) {
    if (!await verifyCrmRole()) return null;
    try {
        const res = await SellingService.getDeliveryNote(name);
        return res.data;
    } catch (e) { return null; }
}

export async function createDeliveryNote(data: DeliveryNoteData) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const res = await SellingService.createDeliveryNote(data);
        revalidatePath("/handson/all/accounting/selling/delivery-note");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
