"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function getAdminStatistics() {
  try {
    return await paasCall("api.admin_reports.get_admin_statistics");
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return null;
  }
}
