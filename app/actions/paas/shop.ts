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
