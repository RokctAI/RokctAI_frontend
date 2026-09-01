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

export async function getDeliveryStatistics() {
  try {
    return await paasCall("api.delivery_man.get_deliveryman_statistics");
  } catch (error) {
    console.error("Failed to fetch statistics:", error);
    return null;
  }
}

export async function getDeliveryOrders(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.delivery_man.get_deliveryman_orders", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export async function getParcelOrders(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.delivery_man.get_deliveryman_parcel_orders", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch parcel orders:", error);
    return [];
  }
}

export async function getDeliverySettings() {
  try {
    return await paasCall("api.delivery_man.get_deliveryman_settings");
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return {};
  }
}

export async function updateDeliverySettings(settings: any) {
  try {
    await paasCall("api.delivery_man.update_deliveryman_settings", {
      settings_data: settings,
    });
    revalidatePath("/paas/dashboard/delivery/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    throw error;
  }
}

export async function getPayouts(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.delivery_man.get_payment_to_partners", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch payouts:", error);
    return [];
  }
}

export async function getDeliveryZones() {
  try {
    return await paasCall("api.delivery_man.get_deliveryman_delivery_zones");
  } catch (error) {
    console.error("Failed to fetch delivery zones:", error);
    return [];
  }
}
