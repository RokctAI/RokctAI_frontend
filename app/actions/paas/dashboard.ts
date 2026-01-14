"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getDashboardStats() {
    const frappe = await getPaaSClient();

    try {
        const stats = await frappe.call({
            method: "paas.api.seller_reports.seller_reports.get_seller_statistics"
        });
        // Ensure response is serializable (removes null prototypes/classes)
        return JSON.parse(JSON.stringify(stats.message || stats));
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        return null;
    }
}
