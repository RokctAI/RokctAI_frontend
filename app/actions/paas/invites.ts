/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
