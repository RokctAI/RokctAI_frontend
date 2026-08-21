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
