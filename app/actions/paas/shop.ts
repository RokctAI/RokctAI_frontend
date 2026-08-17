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
