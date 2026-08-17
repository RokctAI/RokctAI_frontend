"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function getReportData(reportType: string, filters: any = {}) {
  try {
    return await paasCall("api.admin_reports.get_admin_report", {
        doctype: reportType, // Mapping reportType to DocType or specific report logic
        filters: filters,
      });
  } catch (error) {
    console.error(`Failed to fetch ${reportType} report:`, error);
    return [];
  }
}

export async function getRevenueReport(dateRange: {
  from: string;
  to: string;
}) {
  try {
    return await paasCall("api.admin_reports.get_multi_company_sales_report", { from_date: dateRange.from, to_date: dateRange.to });
  } catch (error) {
    console.error("Failed to fetch revenue report:", error);
    return [];
  }
}
