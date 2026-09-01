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

export async function getParcelSettings() {
  try {
    const settings = await paasCall(
      "api.parcel_order_setting.get_parcel_order_settings",
    );
    return settings;
  } catch (error) {
    console.error("Failed to fetch parcel settings:", error);
    return [];
  }
}

export async function createParcelSetting(data: any) {
  try {
    const setting = await paasCall(
      "api.parcel_order_setting.create_parcel_order_setting",
      {
        setting_data: data,
      },
    );
    revalidatePath("/paas/dashboard/settings/parcel");
    return setting;
  } catch (error) {
    console.error("Failed to create parcel setting:", error);
    throw error;
  }
}

export async function updateParcelSetting(name: string, data: any) {
  try {
    const setting = await paasCall(
      "api.parcel_order_setting.update_parcel_order_setting",
      {
        name: name,
        setting_data: data,
      },
    );
    revalidatePath("/paas/dashboard/settings/parcel");
    return setting;
  } catch (error) {
    console.error("Failed to update parcel setting:", error);
    throw error;
  }
}

export async function deleteParcelSetting(name: string) {
  try {
    await paasCall("api.parcel_order_setting.delete_parcel_order_setting", {
      name: name,
    });
    revalidatePath("/paas/dashboard/settings/parcel");
    return { success: true };
  } catch (error) {
    throw error;
  }
}

// Parcel Orders

export async function getParcelOrders(limit = 20, offset = 0) {
  try {
    const orders = await paasCall("api.parcel.get_parcel_orders", {
      limit,
      offset,
    });
    return orders;
  } catch (error) {
    console.error("Failed to fetch parcel orders:", error);
    return [];
  }
}

export async function getParcelOrder(name: string) {
  try {
    const order = await paasCall("api.parcel.get_user_parcel_order", { name });
    return order;
  } catch (error) {
    console.error("Failed to fetch parcel order:", error);
    return null;
  }
}

export async function updateParcelStatus(name: string, status: string) {
  try {
    const order = await paasCall("api.parcel.update_parcel_status", {
      parcel_order_id: name,
      status: status,
    });
    revalidatePath("/paas/dashboard/orders/parcels");
    return order;
  } catch (error) {
    console.error("Failed to update parcel status:", error);
    throw error;
  }
}
