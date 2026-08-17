"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";


export async function getShops(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_management.get_all_shops", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch shops:", error);
    return [];
  }
}

export async function createShop(data: any) {
  try {
    const shop = await paasCall("api.admin_management.create_shop", { shop_data: data });
    revalidatePath("/paas/admin/shops");
    return shop;
  } catch (error) {
    console.error("Failed to create shop:", error);
    throw error;
  }
}

export async function updateShop(name: string, data: any) {
  try {
    const shop = await paasCall("api.admin_management.update_shop", { shop_name: name, shop_data: data });
    revalidatePath("/paas/admin/shops");
    return shop;
  } catch (error) {
    console.error("Failed to update shop:", error);
    throw error;
  }
}

export async function deleteShop(name: string) {
  try {
    await paasCall("api.admin_management.delete_shop", { shop_name: name });
    revalidatePath("/paas/admin/shops");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete shop:", error);
    throw error;
  }
}

export async function getShopCategories(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_data.get_all_shop_categories", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch shop categories:", error);
    return [];
  }
}

export async function getShopReviews(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_records.get_all_shop_reviews", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch shop reviews:", error);
    return [];
  }
}

export async function getShopTags(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_data.get_all_shop_tags", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch shop tags:", error);
    return [];
  }
}

export async function getShopUnits(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_data.get_all_units", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch shop units:", error);
    return [];
  }
}

export async function getShopTypes() {
  try {
    return await paasCall("api.shop.get_shop_types");
  } catch (error) {
    console.error("Failed to fetch shop types:", error);
    return [];
  }
}
