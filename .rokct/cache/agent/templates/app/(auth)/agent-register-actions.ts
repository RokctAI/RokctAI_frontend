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

// rokct.ai's register server actions (agent_sdk 1.12.0): what the register
// page's client half calls on the server. getIndustries() is the function
// auth_sdk's app/(auth)/actions.ts exported until 1.6.0, moved here as it
// was - the Industry Type catalogue read from the control site under the
// platform administrator's keys, which components/custom/auth/
// agent-register-config.ts's industry field loads its options through.
// A "use server" module exports async functions only, so the rest of the
// register machinery is ./agent-register-helpers.ts.

import { platformCall } from "@/app/services/base/platform-gateway";
import { loadTenantLink } from "@/app/(auth)/tenant-link";

export async function getIndustries(): Promise<string[]> {
  try {
    const baseUrl = process.env.ROKCT_BASE_URL;
    if (!baseUrl) return [];

    // Retrieve Admin Keys through the same seam the register path uses.
    const tenantLink = await loadTenantLink();
    const admin = await tenantLink.adminCredentials();
    const adminKey = admin ? admin.apiKey : null;
    const adminSecret = admin ? admin.apiSecret : null;

    if (!adminKey || !adminSecret) return [];

    // Framework methods ride the gateway with the full dotted frappe path
    // (same cmd the ControlBaseService.getList helper uses).
    const industries = await platformCall<any[]>(
      "frappe.client.get_list",
      {
        doctype: "Industry Type",
        fields: ["name"],
        limit_page_length: 100,
        order_by: "name asc",
      },
      {
        baseUrl,
        headers: { Authorization: `token ${adminKey}:${adminSecret}` },
      },
    );

    if (Array.isArray(industries)) {
      return industries.map((item: any) => item.name);
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch industries:", error);
    return [];
  }
}
