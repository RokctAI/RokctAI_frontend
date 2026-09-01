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

export async function getSellerInvites() {
  try {
    const response = await paasCall("api.seller_invites.get_seller_invites");
    return response.message || [];
  } catch (error) {
    console.error("Failed to fetch seller invites:", error);
    return [];
  }
}

export async function updateInviteStatus(
  inviteId: string,
  status: "Accepted" | "Rejected",
) {
  const frappe = await getPaaSClient();
  try {
    return await frappe.call({
      method: "frappe.client.set_value",
      args: {
        doctype: "Invitation",
        name: inviteId,
        fieldname: "status",
        value: status,
      },
    });
  } catch (error) {
    console.error("Failed to update invite status:", error);
    throw error;
  }
}
