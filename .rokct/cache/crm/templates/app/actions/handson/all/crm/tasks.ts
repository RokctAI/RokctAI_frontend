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

export async function getTasks(page = 1, limit = 20) {
  if (!(await verifyCrmRole())) return { data: [], total: 0 };

  const client = await getClient();
  const start = (page - 1) * limit;

  try {
    const tasks = await (client as any).get_list("Sales Task", {
      fields: [
        "name",
        "title",
        "description",
        "assigned_to", // Link to User
        "status",
        "priority",
        "due_date",
        "modified",
        "creation",
      ],
      limit_start: start,
      limit_page_length: limit,
      order_by: "creation desc",
    });

    const countRes = await (client as any).call({
      method: "frappe.client.get_value",
      args: {
        doctype: "Sales Task",
        filters: {},
        fieldname: "count(name) as total",
      },
    });

    return {
      data: tasks,
      total: countRes?.message?.total || 0,
      page: page,
      limit: limit,
    };
  } catch (e) {
    console.error("Failed to fetch Tasks", e);
    return { data: [], total: 0 };
  }
}
