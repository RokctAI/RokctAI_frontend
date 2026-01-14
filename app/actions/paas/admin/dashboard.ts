"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getAdminStatistics() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_reports.admin_reports.get_admin_statistics"
        });
    } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        return null;
    }
}
