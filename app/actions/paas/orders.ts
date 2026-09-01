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
    const order = await paasCall(
      "api.seller_order.update_seller_order_status",
      {
        order_id: id,
        status: status,
      },
    );
    return order;
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error;
  }
}
