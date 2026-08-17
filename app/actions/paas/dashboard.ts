"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function getDashboardStats() {
  try {
    const stats = await paasCall("api.seller_reports.get_seller_statistics");
    // Ensure response is serializable (removes null prototypes/classes)
    return JSON.parse(JSON.stringify(stats.message || stats));
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return null;
  }
}
