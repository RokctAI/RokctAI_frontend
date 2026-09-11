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

/**
 * Client usage for the rpanel dashboard, through the ONE platform gateway
 * (ADR-005), never a per-method URL.
 *
 * It had to move: `FrappeApp.call()` takes ZERO arguments and returns a
 * `FrappeCall` (frappe-js-sdk 1.12.0, `lib/frappe_app/index.d.ts`), so the
 * method name was discarded, no HTTP request was issued, and the dashboard
 * rendered an SDK builder object as if it were usage data. The compiler
 * was already saying so — `TS2554: Expected 0 arguments, but got 1` on
 * `main`. The explicit `baseUrl` keeps this on the control plane, which is
 * what `getControlClient()` did by ignoring the session's tenant site.
 */
export async function getClientUsage() {
  try {
    const response = await platformCall<Record<string, any>>(
      "rpanel.hosting.doctype.hosting_client.hosting_client.get_client_usage",
      undefined,
      {
        baseUrl:
          process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.ROKCT_BASE_URL,
        throwOnError: true,
      },
    );
    // `platformCall` already unwrapped Frappe's `message` envelope.
    return response;
  } catch (error: any) {
    console.error("Error fetching client usage:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch client usage",
    };
  }
}
