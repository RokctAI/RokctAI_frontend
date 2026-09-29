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

import { paasCall } from "@/app/services/base/platform-gateway";
import { revalidatePath } from "next/cache";

// The admin POS rings sales up on the signed-in operator's own shop, over
// the same cmds the seller POS uses (orders/dart PosProductsRepository and
// PosSaleQueue): products from api.seller_product.get_seller_products,
// categories from api.category.get_categories, and the sale through
// api.order.create_order with the canonical order_data contract
// (shop / user / order_items[].product + quantity).

function unwrapList(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

export async function getPOSProducts(
  category: string = "",
  search: string = "",
  page: number = 1,
  limit: number = 20,
) {
  const start = (page - 1) * limit;
  try {
    // Search and category are filtered server-side so paging covers the
    // whole catalogue, not just the current page.
    const q = search.trim();
    const products = unwrapList(
      await paasCall("api.seller_product.get_seller_products", {
        limit_start: start,
        limit_page_length: limit,
        ...(q ? { search: q } : {}),
        ...(category ? { category } : {}),
      }),
    );
    return products.filter(
      (p) => p.active === undefined || Number(p.active) === 1,
    );
  } catch (error) {
    console.error("Failed to fetch POS products:", error);
    return [];
  }
}

export async function getPOSCategories() {
  try {
    return unwrapList(
      await paasCall("api.category.get_categories", {
        limit_start: 0,
        limit_page_length: 100,
        active: 1,
      }),
    );
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function createPOSOrder(orderData: any) {
  try {
    const shop = await paasCall("api.seller_shop.get_shop");
    const shopId = shop?.id ?? shop?.data?.id;
    if (!shopId) {
      throw new Error("No shop is linked to this account");
    }
    const items: any[] = orderData?.items ?? orderData?.order_items ?? [];
    const result = await paasCall("api.order.create_order", {
      order_data: {
        shop: shopId,
        // Walk-in sale: create_order falls back to the session user.
        ...(orderData?.user ? { user: orderData.user } : {}),
        delivery_type: "Pickup",
        status: "Delivered",
        // No quoted_total: create_order wallet-refunds any surplus to the order user (the operator on walk-ins).
        order_items: items.map((item) => ({
          product: item.product ?? item.name,
          quantity: item.quantity,
        })),
        offline_uuid: orderData?.offline_uuid ?? crypto.randomUUID(),
      },
    });
    revalidatePath("/admin/pos");
    return { success: true, orderId: result?.data?.name ?? result?.name };
  } catch (error) {
    console.error("Failed to create POS order:", error);
    throw error;
  }
}
