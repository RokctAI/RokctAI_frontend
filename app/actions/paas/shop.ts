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
import { getPaaSClient } from "@/app/lib/client";

export async function getShop() {
  try {
    const shop = await paasCall("api.seller_shop.get_shop");
    return shop;
  } catch (error) {
    console.error("Failed to fetch shop:", error);
    return null;
  }
}

export async function updateShop(data: any) {
  try {
    const shop = await paasCall("api.seller_shop.update_shop", {
      shop_data: data,
    });
    return shop;
  } catch (error) {
    console.error("Failed to update shop:", error);
    throw error;
  }
}

export async function setWorkingStatus(status: boolean) {
  try {
    const result = await paasCall("api.seller_shop.set_working_status", {
      status: status,
    });
    return result;
  } catch (error) {
    console.error("Failed to set working status:", error);
    throw error;
  }
}

export async function getShops() {
  const frappe = await getPaaSClient();
  try {
    return await frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Shop",
        fields: ["name", "shop_name"],
        limit_page_length: 50,
      },
    });
  } catch (error) {
    console.error("Failed to fetch shops:", error);
    return [];
  }
}
