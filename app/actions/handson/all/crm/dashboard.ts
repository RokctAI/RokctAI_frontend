"use server";

import { getClient } from "@/app/lib/client";
import { verifyCrmRole } from "@/app/lib/roles";

export async function getDashboardStats(fromDate?: string, toDate?: string) {
    if (!await verifyCrmRole()) return { data: [], error: "Unauthorized" };

    const client = await getClient();

    // Default to last 30 days if not provided
    if (!fromDate || !toDate) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        fromDate = start.toISOString().split('T')[0];
        toDate = end.toISOString().split('T')[0];
    }

    try {
        // Direct call to CRM API
        // Function path: crm.api.dashboard.get_dashboard
        const result = await (client as any).call({
            method: "crm.api.dashboard.get_dashboard",
            args: {
                from_date: fromDate,
                to_date: toDate
            }
        });

        return { data: result.message || [] };

    } catch (e) {
        console.error("Failed to fetch CRM Dashboard", e);
        return { data: [], error: "Failed to load dashboard" };
    }
}
