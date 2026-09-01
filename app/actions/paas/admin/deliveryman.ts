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

export async function getDeliveries(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_logistics.get_all_deliveries", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch deliveries:", error);
    return [];
  }
}

export async function getDeliveryStatistics() {
  try {
    return await paasCall("api.admin_logistics.get_delivery_statistics");
  } catch (error) {
    console.error("Failed to fetch delivery statistics:", error);
    return {};
  }
}

export async function getDeliverymanReviews(
  page: number = 1,
  limit: number = 20,
) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_logistics.get_deliveryman_reviews", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch deliveryman reviews:", error);
    return [];
  }
}

export async function getDeliverymanRequests(
  page: number = 1,
  limit: number = 20,
) {
  const start = (page - 1) * limit;
  try {
    // Rows carry model_type so the UI can distinguish deliveryman requests.
    return await paasCall("api.admin_records.get_all_request_models", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch deliveryman requests:", error);
    return [];
  }
}

export async function updateDeliverymanRequest(name: string, status: string) {
  try {
    await paasCall("api.admin_logistics.update_deliveryman_request", {
      request_name: name,
      status: status,
    });
    revalidatePath("/paas/admin/deliveryman/requests");
    return { success: true };
  } catch (error) {
    console.error("Failed to update deliveryman request:", error);
    throw error;
  }
}
