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

import "server-only";

import type { FrappeApp } from "frappe-js-sdk";

import { PLATFORM_GATEWAY_METHOD } from "@/app/services/base/platform-gateway";

/**
 * Executes a gateway `cmd` on the site the given client points at, through
 * the universal platform gateway — the ONE method name that serves every
 * backend (see app/services/base/platform-gateway.ts / ADR-005). No
 * per-method URLs: this POSTs `{cmd, payload}` to
 * `/api/v1/method/rokct.platform.api` via the client's own axios instance
 * (which already carries the base URL and auth headers), and the gateway
 * routes to the target server-side.
 *
 * `cmd` semantics follow the gateway contract:
 *
 *  - tenant-side methods: prefix-free dotted manifest keys — the module
 *    manifest alias key minus `{app_name}.` (e.g.
 *    `tenant.api.get_subscription_details`). Never app-prefixed
 *    (no `paas.` / `rcore.`).
 *  - framework methods: the full dotted frappe path
 *    (e.g. `frappe.client.get_list`).
 *  - control-side methods: verbatim `control:<name>` — but prefer
 *    `platformCall` from platform-gateway.ts for those.
 *
 * Returns the full response body. As with the old per-method API, Frappe
 * wraps the gateway's return value in a single top-level `message`
 * envelope (the same envelope `platformCall` unwraps with
 * `data?.message || data`), so existing `response?.message` consumers keep
 * working unchanged.
 *
 * Throws on any non-2xx response (axios semantics), so existing try/catch
 * call sites keep their error handling.
 */
export async function gatewayCall<T = any>(
  client: FrappeApp,
  cmd: string,
  payload: Record<string, unknown> = {},
  headers?: Record<string, string>,
): Promise<T> {
  const res = await client.axios.post(
    `/api/v1/method/${PLATFORM_GATEWAY_METHOD}`,
    { cmd, payload },
    headers ? { headers } : undefined,
  );
  return res.data as T;
}
