"use server";

import { AnalyticsService, StandardReportDef } from "@/app/services/all/reports/analytics";

const STANDARD_REPORTS: StandardReportDef[] = [
    {
        name: "sales_register",
        title: "Sales Register",
        description: "List of all invoices with customer and grand total.",
        doctype: "Sales Invoice",
        category: "Sales",
        defaultColumns: ["name", "customer_name", "posting_date", "grand_total", "status"]
    },
    {
        name: "stock_balance",
        title: "Stock Balance",
        description: "Current stock levels by item.",
        doctype: "Bin",
        category: "Stock",
        defaultColumns: ["item_code", "warehouse", "actual_qty", "valuation_rate"]
    },
    {
        name: "purchase_register",
        title: "Purchase Register",
        description: "List of all purchase invoices.",
        doctype: "Purchase Invoice",
        category: "Financial",
        defaultColumns: ["name", "supplier_name", "posting_date", "grand_total", "status"]
    },
    {
        name: "customer_list",
        title: "Customer Directory",
        description: "All active customers and their territory.",
        doctype: "Customer",
        category: "Sales",
        defaultColumns: ["customer_name", "customer_group", "territory", "customer_type"]
    }
];

export async function getStandardReports(): Promise<StandardReportDef[]> {
    // In future, this could come from a database config.
    return STANDARD_REPORTS;
}

export async function runCustomReport(doctype: string, fields: string[], filters: any = {}) {
    try {
        const data = await AnalyticsService.runCustomReport(doctype, fields, filters);
        return { success: true, data: data };
    } catch (e: any) {
        console.error(`Failed to run report for ${doctype}`, e);
        return { success: false, error: e.message };
    }
}

/**
 * Execute a read-only SQL query on the Tenant Site.
 * Used by Control-Managed Reports.
 */
export async function executeReportQuery(sql: string) {
    try {
        const data = await AnalyticsService.executeReportQuery(sql);
        return { success: true, data: data };
    } catch (e: any) {
        console.error("Report execution failed", e);
        return { success: false, error: e?.message || "Execution Failed" };
    }
}
