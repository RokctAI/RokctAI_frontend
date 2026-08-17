"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function getWorkingHours() {
  try {
    const hours = await paasCall("api.seller_shop_settings.get_seller_shop_working_days");
    return hours;
  } catch (error) {
    console.error("Failed to fetch working hours:", error);
    return [];
  }
}

export async function updateWorkingHours(data: any) {
  try {
    const result = await paasCall("api.seller_shop_settings.update_seller_shop_working_days", {
        working_days_data: data,
      });
    return result;
  } catch (error) {
    console.error("Failed to update working hours:", error);
    throw error;
  }
}
