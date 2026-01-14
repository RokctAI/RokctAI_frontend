"use server";

import { SellingService } from "@/app/services/all/accounting/selling";
import { revalidatePath } from "next/cache";
import { verifyCrmRole } from "@/app/lib/roles";

export async function getSalesOrders() {
    if (!await verifyCrmRole()) return [];
    try {
        const res = await SellingService.getSalesOrders();
        return res.data;
    } catch (e) { return []; }
}

export async function getSalesOrder(name: string) {
    if (!await verifyCrmRole()) return null;
    try {
        const res = await SellingService.getSalesOrder(name);
        return res.data;
    } catch (e) { return null; }
}

export async function createSalesOrder(data: any) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const res = await SellingService.createSalesOrder(data);
        revalidatePath("/handson/all/accounting/selling/sales-order");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

// Customers are often needed for Sales Order creation
export async function getCustomers() {
    if (!await verifyCrmRole()) return [];
    try {
        const res = await SellingService.getCustomers();
        return res.data;
    } catch (e) { return []; }
}
