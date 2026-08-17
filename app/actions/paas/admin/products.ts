"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";


export async function getAllProducts(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_management.get_all_products", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getAllCategories(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_management.get_all_categories", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function getAllProductExtraGroups(
  page: number = 1,
  limit: number = 20,
) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_data.get_all_product_extra_groups", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch extra groups:", error);
    return [];
  }
}

export async function getAllReceipts(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_records.get_all_receipts", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch receipts:", error);
    return [];
  }
}

export async function getAllProductReviews(
  page: number = 1,
  limit: number = 20,
) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_records.get_all_product_reviews", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch product reviews:", error);
    return [];
  }
}
