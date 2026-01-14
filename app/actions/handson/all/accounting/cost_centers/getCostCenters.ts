"use server";

import { CostCenterService } from "@/app/services/all/accounting/cost_centers";

export async function getCostCenters() {
    try {
        const list = await CostCenterService.getList();
        return list;
    } catch (e) {
        console.error("Failed to fetch Cost Centers", e);
        return [];
    }
}
