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
import { auth } from "@/app/(auth)/auth";
import { gatewayCall } from "@/app/lib/gateway-rpc";

export async function getMyProjects(data: { modelId?: string } = {}) {
  // GUARDRAIL: Only active employees can access work management.
  const { verifyActiveEmployee } = await import("@/app/lib/roles");
  if (!(await verifyActiveEmployee()))
    return {
      success: false,
      error: "Access Restricted: Account is not active.",
    };

  const session = await auth();
  const client = await getClient();

  try {
    const projects = await gatewayCall(client, "frappe.client.get_list", {
        doctype: "Project",
        filters: { status: "Open" }, // Todo: Filter by _user_tags or team?
        fields: [
          "name",
          "project_name",
          "status",
          "percent_complete",
          "expected_end_date",
        ],
        limit_page_length: 10,
      });

    return { success: true, projects: projects?.message || [] };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to fetch projects" };
  }
}

export async function getMyTasks(data: { modelId?: string } = {}) {
  // GUARDRAIL: Only active employees can access tasks.
  const { verifyActiveEmployee } = await import("@/app/lib/roles");
  if (!(await verifyActiveEmployee()))
    return {
      success: false,
      error: "Access Restricted: Account is not active.",
    };

  const session = await auth();
  const client = await getClient();

  try {
    const tasks = await gatewayCall(client, "frappe.client.get_list", {
        doctype: "Task",
        filters: { status: "Open" }, // Filter by user assignment in real world
        fields: [
          "name",
          "subject",
          "status",
          "priority",
          "exp_end_date",
          "project",
        ],
        limit_page_length: 10,
        order_by: "exp_end_date asc",
      });

    return { success: true, tasks: tasks?.message || [] };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to fetch tasks" };
  }
}
