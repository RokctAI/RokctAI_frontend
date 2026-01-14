"use server";

import { DashboardService } from "@/app/services/all/hrms/dashboard";

export async function getPendingApprovals() {
    try {
        return await DashboardService.getPendingApprovals();
    } catch (e) {
        console.error("Failed to fetch approvals", e);
        return [];
    }
}
