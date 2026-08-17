/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use server";

import { getClient } from "@/app/lib/client";
import { getCurrentEmployeeId } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";

export async function getMyTimesheets() {
  const employeeId = await getCurrentEmployeeId();
  if (!employeeId) return [];

  const client = await getClient();
  try {
    const response = await client.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Timesheet",
        filters: { employee: employeeId },
        fields: [
          "name",
          "employee_name",
          "total_hours",
          "status",
          "start_date",
        ],
        limit_page_length: 50,
        order_by: "creation desc",
      },
    });
    return response?.message || [];
  } catch (e) {
    console.error("Failed to fetch My Timesheets", e);
    return [];
  }
}

export async function createMyTimesheet(data: any) {
  const employeeId = await getCurrentEmployeeId();
  if (!employeeId) return { success: false, error: "Unauthorized" };

  const client = await getClient();
  try {
    const response = await client.call({
      method: "frappe.client.insert",
      args: {
        doc: {
          doctype: "Timesheet",
          employee: employeeId,
          ...data,
        },
      },
    });
    revalidatePath("/handson/all/projects/me/timesheets"); // Hypothetical path
    return { success: true, message: response?.message };
  } catch (e: any) {
    console.error("Failed to create My Timesheet", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}
