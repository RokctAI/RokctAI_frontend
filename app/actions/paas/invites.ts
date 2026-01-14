"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getSellerInvites() {
    const frappe = await getPaaSClient();
    try {
        const response = await frappe.call({
            method: "paas.api.seller_invites.seller_invites.get_seller_invites",
        });
        return response.message || [];
    } catch (error) {
        console.error("Failed to fetch seller invites:", error);
        return [];
    }
}

export async function updateInviteStatus(inviteId: string, status: "Accepted" | "Rejected") {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "Invitation",
                name: inviteId,
                fieldname: "status",
                value: status
            }
        });
    } catch (error) {
        console.error("Failed to update invite status:", error);
        throw error;
    }
}
