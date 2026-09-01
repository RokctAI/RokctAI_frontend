/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
        fields: [
          "name",
          "subject",
          "starts_on",
          "ends_on",
          "description",
          "event_type",
          "color",
          "location",
        ],
        filters: filters,
        order_by: "starts_on asc",
        limit_page_length: 100,
      },
    });

    return { success: true, events: events?.message || [] };
  } catch (e: any) {
    console.error("Failed to fetch calendar events", e);
    return { success: false, error: e?.message || "Failed to fetch events" };
  }
}
