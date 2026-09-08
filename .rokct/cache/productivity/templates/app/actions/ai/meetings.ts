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
import { auth } from "@/app/(auth)/auth";
import { gatewayCall } from "@/app/lib/gateway-rpc";

export async function getMyEvents(data: { modelId?: string } = {}) {
  const { verifyActiveEmployee } = await import("@/app/lib/roles");
  if (!(await verifyActiveEmployee()))
    return { success: false, error: "Access Restricted" };

  const session = await auth();
  const client = await getClient();

  try {
    const events = await gatewayCall(client, "frappe.client.get_list", {
        doctype: "Event",
        filters: {
          starts_on: [">=", new Date().toISOString().split("T")[0]],
          status: "Open",
        },
        fields: ["name", "subject", "starts_on", "event_type"],
        order_by: "starts_on asc",
        limit_page_length: 5,
      });

    return { success: true, events: events?.message || [] };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}
