"use server";

import { BuyingService } from "@/app/services/all/accounting/buying";
import { revalidatePath } from "next/cache";

export interface SupplierData {
    supplier_name: string;
    supplier_group?: string;
    supplier_type: "Company" | "Individual";
    country?: string;
    email_id?: string;
}

export async function getSuppliers() {
    try {
        const res = await BuyingService.getSuppliers();
        return res.data;
    } catch (e) { return []; }
}

export async function createSupplier(data: SupplierData) {
    try {
        const res = await BuyingService.createSupplier(data);
        revalidatePath("/handson/all/accounting/buying/supplier");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

export async function getSupplierQuotations() {
    try {
        const res = await BuyingService.getSupplierQuotations();
        return res.data;
    } catch (e) { return []; }
}

export async function createSupplierQuotation(data: { supplier: string; items: { item_code: string; qty: number; rate: number }[] }) {
    try {
        const res = await BuyingService.createSupplierQuotation(data);
        revalidatePath("/handson/all/accounting/buying/supplier-quotation");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

export async function getSupplierScorecards() {
    try {
        const res = await BuyingService.getSupplierScorecards();
        return res.data;
    } catch (e) { return []; }
}
