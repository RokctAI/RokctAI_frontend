'use server'

import { getClient } from "@/app/lib/client";
import { verifyCrmRole } from "@/app/lib/roles";

export async function getCallLogs(page = 1, limit = 20) {
    if (!await verifyCrmRole()) return { data: [], total: 0, error: "Unauthorized" };
    const client = await getClient();

    try {
        const start = (page - 1) * limit;

        const logs = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "CRM Call Log",
                fields: ["name", "title", "status", "call_type", "start_time", "duration", "owner", "modified"],
                order_by: "modified desc",
                limit_start: start,
                limit_page_length: limit
            }
        });

        const countRes = await (client as any).call({
            method: "frappe.client.get_count",
            args: { doctype: "CRM Call Log" }
        });

        return {
            data: logs,
            total: countRes || 0,
            page: page,
            limit: limit
        };

    } catch (e) {
        console.error("Failed to fetch Call Logs", e);
        return { data: [], total: 0 };
    }
}
