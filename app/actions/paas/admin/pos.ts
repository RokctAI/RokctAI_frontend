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

export async function getPOSProducts(
  category: string = "",
  search: string = "",
  page: number = 1,
  limit: number = 20,
) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_management.get_pos_products", {
      category,
      search,
      limit_start: start,
      limit_page_length: limit,
    });
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
    const result = await paasCall("api.admin_management.create_pos_order", {
      order_data: orderData,
    });
    revalidatePath("/paas/admin/pos");
    return { success: true, orderId: result.name };
  } catch (error) {
    console.error("Failed to create POS order:", error);
    throw error;
  }
}
