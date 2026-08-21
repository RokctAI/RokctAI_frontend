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

export async function getOrders(
  page: number = 1,
  limit: number = 20,
  type: string = "",
  status: string = "",
) {
  const start = (page - 1) * limit;

  const filters: any = {};
  if (type && type !== "all") filters.order_type = type;
  if (status && status !== "all") filters.status = status;

  try {
    return await paasCall("api.admin_records.get_all_orders", {
      limit_start: start,
      limit_page_length: limit,
      filters: filters,
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export async function getOrderStatuses() {
  try {
    return await paasCall("api.order.get_order_statuses");
  } catch (error) {
    console.error("Failed to fetch order statuses:", error);
    return [];
  }
}

export async function updateOrderStatus(name: string, status: string) {
  try {
    await paasCall("api.order.update_order_status", {
      order_id: name,
      status: status,
    });
    revalidatePath("/paas/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error;
  }
}

export async function getParcelOrders(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_records.get_all_parcel_orders", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch parcel orders:", error);
    return [];
  }
}

export async function getRefunds(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_records.get_all_order_refunds", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch refunds:", error);
    return [];
  }
}

export async function updateRefund(
  name: string,
  status: string,
  answer?: string,
) {
  try {
    await paasCall("api.admin_records.update_admin_order_refund", {
      refund_name: name,
      status,
      answer,
    });
    revalidatePath("/paas/admin/orders/refunds");
    return { success: true };
  } catch (error) {
    console.error("Failed to update refund:", error);
    throw error;
  }
}

export async function getBookings(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_records.get_all_bookings", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }
}

export async function getOrderReviews(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    // Platform-wide review list; rows carry reviewable_type/reviewable_id
    // so order reviews can be distinguished client-side.
    return await paasCall("api.admin_records.get_all_reviews", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch order reviews:", error);
    return [];
  }
}
