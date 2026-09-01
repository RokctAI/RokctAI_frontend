/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

export async function getAllProducts(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.product.get_products", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getAllCategories(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.category.get_categories", {
      limit_start: start,
      limit_page_length: limit,
    });
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
    return await paasCall("api.admin_data.get_all_product_extra_groups", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch extra groups:", error);
    return [];
  }
}

export async function getAllReceipts(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.receipt.get_receipts", {
      limit_start: start,
      limit_page_length: limit,
    });
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
    // Platform-wide review list; rows carry reviewable_type/reviewable_id
    // so product reviews can be distinguished client-side.
    return await paasCall("api.admin_records.get_all_reviews", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch product reviews:", error);
    return [];
  }
}
