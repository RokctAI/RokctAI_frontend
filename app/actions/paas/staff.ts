"use server";

import { getPaaSClient } from "@/app/lib/client";

// Staff Management - Generic function to get staff by role
async function getStaffByRole(role: string) {
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.user.user.get_user_shop"
        });

        if (!shop) {
            return [];
        }

        // Get users with specific role
        const users = await frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "User",
                filters: {
                    enabled: 1
                },
                fields: ["name", "email", "full_name", "user_image"]
            }
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
