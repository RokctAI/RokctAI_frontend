"use server";

import { InventoryService } from "@/app/services/all/accounting/inventory";

export async function getBatches() {
    try {
        const res = await InventoryService.getBatches();
        return res.data;
    } catch (e) { return []; }
}

export async function getSerialNos() {
    try {
        const res = await InventoryService.getSerialNos();
        return res.data;
    } catch (e) { return []; }
}
