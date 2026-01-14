"use server";

import { InventoryService } from "@/app/services/all/accounting/inventory";
import { revalidatePath } from "next/cache";

// Material Request
export async function getMaterialRequests() {
    try {
        const res = await InventoryService.getMaterialRequests();
        return res.data;
    } catch (e) { return []; }
}

export async function createMaterialRequest(data: { transaction_date: string; material_request_type: string; items: { item_code: string; qty: number; schedule_date: string }[] }) {
    try {
        const res = await InventoryService.createMaterialRequest(data);
        revalidatePath("/handson/all/accounting/inventory"); // or subpath
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

// Pick List
export async function getPickLists() {
    try {
        const res = await InventoryService.getPickLists();
        return res.data;
    } catch (e) { return []; }
}

export async function createPickList(data: { purpose: string; locations: { item_code: string; qty: number; warehouse: string }[] }) {
    try {
        const res = await InventoryService.createPickList(data);
        revalidatePath("/handson/all/accounting/inventory");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

// Shipment
export async function getShipments() {
    try {
        const res = await InventoryService.getShipments();
        return res.data;
    } catch (e) { return []; }
}

export async function createShipment(data: { delivery_from_type: string; delivery_from: string; carrier: string; tracking_number?: string }) {
    try {
        const res = await InventoryService.createShipment(data);
        revalidatePath("/handson/all/accounting/inventory");
        return { success: true, message: res };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
