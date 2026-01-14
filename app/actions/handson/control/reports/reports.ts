"use server";

import { ReportService, ReportDefinition } from "@/app/services/control/reports";
import { revalidatePath } from "next/cache";

export type { ReportDefinition };

/**
 * Fetches all Global Report Definitions.
 * Stored in "SaaS Configuration Item" with category="Report Definition".
 */
export async function getGlobalReports(): Promise<ReportDefinition[]> {
    return ReportService.getGlobalReports();
}

/**
 * Save a Global Report Definition.
 */
export async function saveGlobalReport(report: ReportDefinition) {
    await ReportService.saveGlobalReport(report);
    revalidatePath("/handson/control/reports");
    return { success: true };
}

export async function deleteGlobalReport(name: string) {
    await ReportService.deleteGlobalReport(name);
    revalidatePath("/handson/control/reports");
    return { success: true };
}

/**
 * Seeds some example reports.
 */
export async function seedReports() {
    const examples: ReportDefinition[] = [
        {
            title: "Monthly Sales Revenue",
            category: "Sales",
            sql: "SELECT DATE_FORMAT(transaction_date, '%Y-%m') as date, SUM(grand_total) as total FROM `tabSales Invoice` WHERE docstatus=1 GROUP BY date ORDER BY date DESC LIMIT 12",
            chart_type: "bar",
            x_axis_field: "date",
            y_axis_field: "total",
            is_active: true,
            description: "Revenue trend over the last 12 months."
        },
        {
            title: "Top Customers by Volume",
            category: "Sales",
            sql: "SELECT customer_name as customer, SUM(grand_total) as volume FROM `tabSales Invoice` WHERE docstatus=1 GROUP BY customer_name ORDER BY volume DESC LIMIT 5",
            chart_type: "pie",
            x_axis_field: "customer",
            y_axis_field: "volume",
            is_active: true,
            description: "Who are our top 5 customers?"
        }
    ];

    for (const ex of examples) {
        await saveGlobalReport(ex);
    }
}
