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
  try {
    const report = await paasCall("api.seller_reports.get_seller_order_report", {
        from_date: fromDate,
        to_date: toDate,
      });
    return report;
  } catch (error) {
    console.error("Failed to fetch order report:", error);
    return [];
  }
}
