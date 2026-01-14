"use server";

import { BuyingService } from "@/app/services/all/accounting/buying";
import { revalidatePath } from "next/cache";

export interface SubcontractingOrderData {
    supplier: string;
    items: {
        item_code: string;
        qty: number;
        rate: number;
    }[];
}

export interface SubcontractingReceiptData {
    supplier: string;
    items: {
        item_code: string;
        qty: number;
        rate: number;
    }[];
}

export async function getSubcontractingOrders() {
    try {
        const res = await BuyingService.getSubcontractingOrders();
        return res.data;
    } catch (e) { return []; }
}

export async function createSubcontractingOrder(data: SubcontractingOrderData) {
    try {
        const res = await BuyingService.createSubcontractingOrder(data);
        revalidatePath("/handson/all/accounting/buying/subcontracting/order");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

export async function getSubcontractingReceipts() {
    try {
        const res = await BuyingService.getSubcontractingReceipts();
        return res.data;
    } catch (e) { return []; }
}

export async function createSubcontractingReceipt(data: SubcontractingReceiptData) {
    try {
        const res = await BuyingService.createSubcontractingReceipt(data);
        revalidatePath("/handson/all/accounting/buying/subcontracting/receipt");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
