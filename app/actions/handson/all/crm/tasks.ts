"use server";

import { getClient } from "@/app/lib/client";
import { verifyCrmRole } from "@/app/lib/roles";

export async function getTasks(page = 1, limit = 20) {
    if (!await verifyCrmRole()) return { data: [], total: 0 };

    const client = await getClient();
    const start = (page - 1) * limit;

    try {
        const tasks = await (client as any).get_list("CRM Task", {
            fields: [
                "name",
                "title",
                "description",
                "assigned_to",      // Link to User
                "status",
                "priority",
                "due_date",
                "modified",
                "creation"
            ],
            limit_start: start,
            limit_page_length: limit,
            order_by: "creation desc"
        });

        const countRes = await (client as any).call({
            method: "frappe.client.get_value",
            args: {
                doctype: "CRM Task",
                filters: {},
                fieldname: "count(name) as total"
            }
        });

        return {
            data: tasks,
            total: countRes?.message?.total || 0,
            page: page,
            limit: limit
        };

    } catch (e) {
        console.error("Failed to fetch Tasks", e);
        return { data: [], total: 0 };
    }
}
