"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";


export async function getPOSProducts(
  category: string = "",
  search: string = "",
  page: number = 1,
  limit: number = 20,
) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_management.get_pos_products", { category, search, limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch POS products:", error);
    return [];
  }
}

export async function getPOSCategories() {
  try {
    return await paasCall("api.admin_management.get_all_categories");
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function createPOSOrder(orderData: any) {
  try {
    const result = await paasCall("api.admin_management.create_pos_order", { order_data: orderData });
    revalidatePath("/paas/admin/pos");
    return { success: true, orderId: result.name };
  } catch (error) {
    console.error("Failed to create POS order:", error);
    throw error;
  }
}
