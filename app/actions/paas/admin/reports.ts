"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getReportData(reportType: string, filters: any = {}) {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_reports.admin_reports.get_admin_report",
            args: {
                doctype: reportType, // Mapping reportType to DocType or specific report logic
                filters: filters
            }
        });
    } catch (error) {
        console.error(`Failed to fetch ${reportType} report:`, error);
        return [];
    }
}

export async function getRevenueReport(dateRange: { from: string, to: string }) {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_reports.admin_reports.get_multi_company_sales_report",
            args: { from_date: dateRange.from, to_date: dateRange.to }
        });
    } catch (error) {
        console.error("Failed to fetch revenue report:", error);
        return [];
    }
}
