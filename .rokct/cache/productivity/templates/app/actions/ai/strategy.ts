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
// Goals/Strategy often acceptable for all employees or constrained to managers?
// Access via Employee record usually.

export async function getMyOkrs(data: { modelId?: string } = {}) {
  const { verifyActiveEmployee } = await import("@/app/lib/roles");
  if (!(await verifyActiveEmployee()))
    return { success: false, error: "Access Restricted" };

  const session = await auth();
  const client = await getClient();

  try {
    // Get Employee
    const employeeRes = (await gatewayCall(client, "frappe.client.get_value", {
        doctype: "Employee",
        filters: { user_id: session?.user?.email },
        fieldname: "name",
      })) as any;
    const employee = employeeRes?.message?.name;
    if (!employee) return { success: false, error: "Employee not found." };

    const goals = await gatewayCall(client, "frappe.client.get_list", {
        doctype: "Goal",
        filters: { employee: employee, status: "Open" },
        fields: ["name", "goal", "progress", "end_date"],
        limit_page_length: 5,
      });

    return { success: true, goals: goals?.message || [] };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}
