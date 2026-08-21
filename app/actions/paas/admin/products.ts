/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
