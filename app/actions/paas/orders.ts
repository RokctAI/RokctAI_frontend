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

export async function getOrders(
  page: number = 1,
  perPage: number = 20,
  status?: string,
) {
  try {
    const start = (page - 1) * perPage;
    const orders = await paasCall("api.seller_order.get_seller_orders", {
        limit_start: start,
        limit_page_length: perPage,
        status: status === "all" ? undefined : status,
      });
    return orders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export async function getOrder(id: string) {
  try {
    const order = await paasCall("api.seller_order.get_seller_order_details", {
        order_id: id,
      });
    return order;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    const order = await paasCall("api.seller_order.update_seller_order_status", {
        order_id: id,
        status: status,
      });
    return order;
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error;
  }
}
