/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
