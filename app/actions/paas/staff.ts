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
