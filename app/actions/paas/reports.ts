"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function getSellerStatistics() {
  try {
    const stats = await paasCall("api.seller_reports.get_seller_statistics");
    return stats;
  } catch (error) {
    console.error("Failed to fetch statistics:", error);
    return null;
  }
}

export async function getOrderReport(fromDate?: string, toDate?: string) {
  // api.seller_reports.get_seller_sales_report requires both dates —
  // default to the last 30 days when the caller omits them.
  const to = toDate ?? new Date().toISOString().slice(0, 10);
  const from =
    fromDate ??
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  try {
    const report = await paasCall("api.seller_reports.get_seller_sales_report", {
      from_date: from,
      to_date: to,
    });
    return report;
  } catch (error) {
    console.error("Failed to fetch order report:", error);
    return [];
  }
}
