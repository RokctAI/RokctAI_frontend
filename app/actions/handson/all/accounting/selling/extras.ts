"use server";

import { SellingService } from "@/app/services/all/accounting/selling";
import { revalidatePath } from "next/cache";
import { verifyCrmRole } from "@/app/lib/roles";

export async function getSalesPartners() {
    if (!await verifyCrmRole()) return [];
    try {
        const res = await SellingService.getSalesPartners();
        return res.data;
    } catch (e) { return []; }
}

export async function createSalesPartner(data: { partner_name: string; commission_rate: number; partner_type?: string }) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const res = await SellingService.createSalesPartner(data);
        revalidatePath("/handson/all/accounting/selling/sales-partner");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

export async function getProductBundles() {
    if (!await verifyCrmRole()) return [];
    try {
        const res = await SellingService.getProductBundles();
        return res.data;
    } catch (e) { return []; }
}

export async function createProductBundle(data: { new_item_code: string; items: { item_code: string; qty: number }[] }) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const res = await SellingService.createProductBundle(data);
        revalidatePath("/handson/all/accounting/selling/product-bundle");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

export async function getShippingRules() {
    if (!await verifyCrmRole()) return [];
    try {
        const res = await SellingService.getShippingRules();
        return res.data;
    } catch (e) { return []; }
}

export async function createShippingRule(data: { label: string; calculate_based_on: string; shipping_amount?: number }) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const res = await SellingService.createShippingRule(data);
        revalidatePath("/handson/all/accounting/selling/shipping-rule");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
