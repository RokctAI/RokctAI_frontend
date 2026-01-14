"use server";

import { getClient } from "@/app/lib/client";

export async function updateUserProfile(email: string, data: { first_name?: string; last_name?: string; gender?: string; birth_date?: string }) {
    const client = await getClient();
    try {
        const response = await (client as any).call({
            method: "frappe.client.set_value",
            args: {
                doctype: "User",
                name: email,
                fieldname: data
            }
        });
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error("Failed to update User Profile", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
