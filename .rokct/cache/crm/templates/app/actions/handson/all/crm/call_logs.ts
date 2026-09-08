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

export async function getCallLogs(page = 1, limit = 20) {
  if (!(await verifyCrmRole()))
    return { data: [], total: 0, error: "Unauthorized" };
  const client = await getClient();

  try {
    const start = (page - 1) * limit;

    const logs = await (client as any).call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Call Log",
        fields: [
          "name",
          "title",
          "status",
          "call_type",
          "start_time",
          "duration",
          "owner",
          "modified",
        ],
        order_by: "modified desc",
        limit_start: start,
        limit_page_length: limit,
      },
    });

    const countRes = await (client as any).call({
      method: "frappe.client.get_count",
      args: { doctype: "Call Log" },
    });

    return {
      data: logs,
      total: countRes || 0,
      page: page,
      limit: limit,
    };
  } catch (e) {
    console.error("Failed to fetch Call Logs", e);
    return { data: [], total: 0 };
  }
}
