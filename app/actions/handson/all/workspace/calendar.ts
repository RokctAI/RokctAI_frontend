"use server";

import { getClient } from "@/app/lib/client";

export interface CalendarEvent {
    name: string;
    subject: string;
    starts_on: string;
    ends_on: string;
    description: string;
    event_type: string;
    color?: string;
    location?: string;
    google_meet_link?: string; // If synced from Google
}

export async function getCalendarEvents(start?: string, end?: string) {
    const client = await getClient();

    try {
        const filters: any = {};
        if (start) filters.starts_on = [">=", start];
        if (end) filters.ends_on = ["<=", end];

        const events = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Event",
                fields: ["name", "subject", "starts_on", "ends_on", "description", "event_type", "color", "location"],
                filters: filters,
                order_by: "starts_on asc",
                limit_page_length: 100
            }
        });

        return { success: true, events: events?.message || [] };
    } catch (e: any) {
        console.error("Failed to fetch calendar events", e);
        return { success: false, error: e?.message || "Failed to fetch events" };
    }
}
