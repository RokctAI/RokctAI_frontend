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
