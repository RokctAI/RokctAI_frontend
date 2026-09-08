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
import { verifyCrmRole } from "@/app/lib/roles";
import { PLATFORM_GATEWAY_METHOD } from "@/app/services/base/platform-gateway";

export async function getDashboardStats(fromDate?: string, toDate?: string) {
  if (!(await verifyCrmRole())) return { data: [], error: "Unauthorized" };

  const client = await getClient();

  // Default to last 30 days if not provided
  if (!fromDate || !toDate) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    fromDate = start.toISOString().split("T")[0];
    toDate = end.toISOString().split("T")[0];
  }

  try {
    // Routes through the universal platform gateway with a prefix-free
    // cmd: the gateway resolves "api.crm.dashboard.get_dashboard" against
    // crm/frappe manifest.json's whitelisted alias
    // "{app_name}.api.crm.dashboard.get_dashboard" server-side, so no app
    // prefix is ever hard-coded here. The authenticated frappe client is
    // kept (same as the sibling actions) so token auth still applies.
    const result = await (client as any).call({
      method: PLATFORM_GATEWAY_METHOD,
      args: {
        cmd: "api.crm.dashboard.get_dashboard",
        payload: {
          from_date: fromDate,
          to_date: toDate,
        },
      },
    });

    return { data: result.message || [] };
  } catch (e) {
    console.error("Failed to fetch Sales Dashboard", e);
    return { data: [], error: "Failed to load dashboard" };
  }
}
