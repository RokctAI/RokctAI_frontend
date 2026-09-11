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
 * Rides the ONE platform gateway (ADR-005, a `{cmd, payload}` POST), never
 * a per-method URL. `frappe.client.*` is the framework form the gateway
 * takes verbatim (app/lib/gateway-rpc.ts).
 *
 * It had to move: `FrappeApp.call()` takes ZERO arguments and returns a
 * `FrappeCall` (frappe-js-sdk 1.12.0, `lib/frappe_app/index.d.ts`), so the
 * `{method, args}` object was discarded, no HTTP request was issued, and
 * the caller got an SDK builder back. `throwOnError` keeps the axios
 * semantics the try/catch here was written against.
 */
export async function updateUserProfile(
  email: string,
  data: {
    first_name?: string;
    last_name?: string;
    gender?: string;
    birth_date?: string;
  },
) {
  try {
    const response = await platformCall<Record<string, any>>(
      "frappe.client.set_value",
      {
        doctype: "User",
        name: email,
        fieldname: data,
      },
      { throwOnError: true },
    );
    return { success: true, message: response };
  } catch (e: any) {
    console.error("Failed to update User Profile", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}
