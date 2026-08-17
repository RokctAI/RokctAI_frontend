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

// Staff Management - Generic function to get staff by role
async function getStaffByRole(role: string) {
  const frappe = await getPaaSClient();

  try {
    const shop = await paasCall("api.user.get_user_shop");

    if (!shop) {
      return [];
    }

    // Get users with specific role
    const users = await frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "User",
        filters: {
          enabled: 1,
        },
        fields: ["name", "email", "full_name", "user_image"],
      },
    });

    return users;
  } catch (error) {
    console.error(`Failed to fetch ${role}:`, error);
    return [];
  }
}

export async function getWaiters() {
  return getStaffByRole("Waiter");
}

export async function getCooks() {
  return getStaffByRole("Cook");
}

export async function getDeliveryMen() {
  return getStaffByRole("Delivery Man");
}
