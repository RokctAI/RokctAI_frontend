"use server";

import { InventoryService } from "@/app/services/all/accounting/inventory";
import { revalidatePath } from "next/cache";

// Reconciliation
export async function getStockReconciliations() {
    try {
        const res = await InventoryService.getStockReconciliations();
        return res.data;
    } catch (e) { return []; }
}

export async function createStockReconciliation(data: { company: string; posting_date: string; items: { item_code: string; qty: number; warehouse: string; valuation_rate: number }[] }) {
    try {
        const res = await InventoryService.createStockReconciliation(data);
        revalidatePath("/handson/all/accounting/inventory/reconciliation");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

// Ledger
export async function getStockLedgerEntries() {
    try {
        const res = await InventoryService.getStockLedgerEntries();
        return res.data;
    } catch (e) { return []; }
}

// Landed Cost
export async function getLandedCostVouchers() {
    try {
        const res = await InventoryService.getLandedCostVouchers();
        return res.data;
    } catch (e) { return []; }
}

export async function createLandedCostVoucher(data: { company: string; receipt_document_type: string; receipt_document: string; taxes: { account: string; amount: number }[] }) {
    try {
        const res = await InventoryService.createLandedCostVoucher(data);
        revalidatePath("/handson/all/accounting/inventory");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

// Stock Entry (Missing)
export async function createStockEntry(data: any) {
    try {
        const res = await InventoryService.createStockEntry(data);
        revalidatePath("/handson/all/accounting/inventory");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

export async function getWarehouses() {
    try {
        const res = await InventoryService.getWarehouses();
        return res.data;
    } catch (e) { return []; }
}
