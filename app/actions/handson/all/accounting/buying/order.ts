"use server";

import { BuyingService } from "@/app/services/all/accounting/buying";
import { revalidatePath } from "next/cache";

export interface PurchaseOrderData {
    supplier: string;
    transaction_date: string;
    items: { item_code: string; qty: number; rate: number }[];
    docstatus?: 0 | 1;
}

export async function getPurchaseOrders() {
    try {
        const res = await BuyingService.getPurchaseOrders();
        return res.data;
    } catch (e) { return []; }
}

export async function getPurchaseOrder(name: string) {
    try {
        const res = await BuyingService.getPurchaseOrder(name);
        return res.data;
    } catch (e) { return null; }
}

export async function createPurchaseOrder(data: PurchaseOrderData) {
    try {
        const res = await BuyingService.createPurchaseOrder(data);
        revalidatePath("/handson/all/accounting/buying/order");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

export async function updatePurchaseOrder(name: string, data: Partial<PurchaseOrderData>) {
    try {
        const res = await BuyingService.updatePurchaseOrder(name, data);
        revalidatePath("/handson/all/accounting/buying/order");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

export async function deletePurchaseOrder(name: string) {
    try {
        await BuyingService.deletePurchaseOrder(name);
        revalidatePath("/handson/all/accounting/buying/order");
        return { success: true };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

// Blanket Order
export async function getBlanketOrders() {
    try {
        const res = await BuyingService.getBlanketOrders();
        return res.data;
    } catch (e) { return []; }
}

export async function createBlanketOrder(data: { supplier: string; to_date: string; items: { item_code: string; qty: number; rate: number }[] }) {
    try {
        const res = await BuyingService.createBlanketOrder(data);
        revalidatePath("/handson/all/accounting/buying/order"); // Consolidate under 'order' page usually or blanket-order if exists
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
