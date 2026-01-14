"use server";

import { getClient } from "@/app/lib/client";
import { auth } from "@/app/(auth)/auth";

export async function getMyEvents(data: { modelId?: string } = {}) {
    const { verifyActiveEmployee } = await import("@/app/lib/roles");
    if (!await verifyActiveEmployee()) return { success: false, error: "Access Restricted" };

    const session = await auth();
    const client = await getClient();

    try {
        const events = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Event",
                filters: {
                    "starts_on": [">=", new Date().toISOString().split('T')[0]],
                    "status": "Open"
                },
                fields: ["name", "subject", "starts_on", "event_type"],
                order_by: "starts_on asc",
                limit_page_length: 5
            }
        });

        return { success: true, events: events?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}
