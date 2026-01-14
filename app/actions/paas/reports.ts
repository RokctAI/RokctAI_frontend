"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getSellerStatistics() {
    const frappe = await getPaaSClient();

    try {
        const stats = await frappe.call({
            method: "paas.api.seller_reports.seller_reports.get_seller_statistics"
        });
        return stats;
    } catch (error) {
        console.error("Failed to fetch statistics:", error);
        return null;
    }
}

export async function getOrderReport(fromDate?: string, toDate?: string) {
    const frappe = await getPaaSClient();

    try {
        const report = await frappe.call({
            method: "paas.api.seller_reports.seller_reports.get_seller_order_report",
            args: {
                from_date: fromDate,
                to_date: toDate
            }
        });
        return report;
    } catch (error) {
        console.error("Failed to fetch order report:", error);
        return [];
    }
}
