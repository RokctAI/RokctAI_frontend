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
