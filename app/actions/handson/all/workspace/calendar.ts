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

import { platformCall } from "@/app/services/base/platform-gateway";

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

/**
 * Rides the ONE platform gateway (ADR-005, a `{cmd, payload}` POST), never
 * a per-method URL. `frappe.client.*` is the framework form the gateway
 * takes verbatim (app/lib/gateway-rpc.ts).
 *
 * It had to move: `FrappeApp.call()` takes ZERO arguments and returns a
 * `FrappeCall` (frappe-js-sdk 1.12.0, `lib/frappe_app/index.d.ts`), so the
 * `{method, args}` object was discarded, no HTTP request was issued, and
 * the caller got an SDK builder back. The compiler was already saying so —
 * `TS2554: Expected 0 arguments, but got 1` on `main`. `throwOnError` keeps
 * the axios semantics the try/catch here was written against.
 */
export async function getCalendarEvents(start?: string, end?: string) {
  try {
    const filters: any = {};
    if (start) filters.starts_on = [">=", start];
    if (end) filters.ends_on = ["<=", end];

    const events = await platformCall<CalendarEvent[]>(
      "frappe.client.get_list",
      {
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
      { throwOnError: true },
    );

    return { success: true, events: events || [] };
  } catch (e: any) {
    console.error("Failed to fetch calendar events", e);
    return { success: false, error: e?.message || "Failed to fetch events" };
  }
}
