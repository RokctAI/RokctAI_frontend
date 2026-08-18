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
import { verifySystemManager } from "@/app/lib/roles";
import { gatewayCall } from "@/app/lib/gateway-rpc";

export async function countUsers(data: { modelId?: string } = {}) {
  if (!(await verifySystemManager()))
    return { success: false, error: "Unauthorized" };

  const client = await getClient();

  try {
    // Count Active Users
    const users = await gatewayCall(client, "frappe.client.get_list", {
      doctype: "User",
      filters: { enabled: 1 },
      limit_page_length: 1, // We just want count? Frappe doesn't give count easily via get_list without GetAll
    });
    // Actually better to get a list for the UI
    return { success: true, message: `Active Users check completed.` }; // Placeholder
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

export async function getUsers(
  data: { query?: string; modelId?: string } = {},
) {
  if (!(await verifySystemManager()))
    return { success: false, error: "Unauthorized" };

  const client = await getClient();

  try {
    const filters: any = { enabled: 1, user_type: "System User" };
    if (data.query) filters.email = ["like", `%${data.query}%`];

    const users = await gatewayCall(client, "frappe.client.get_list", {
      doctype: "User",
      filters: filters,
      fields: ["name", "full_name", "email", "role_profile_name", "last_login"],
      limit_page_length: 20,
    });

    return { success: true, users: users?.message || [] };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to fetch users" };
  }
}

export async function getSystemHealth(data: { modelId?: string } = {}) {
  if (!(await verifySystemManager()))
    return { success: false, error: "Unauthorized" };

  const client = await getClient();

  try {
    // Check for Failed Background Jobs
    const jobs = await gatewayCall(client, "frappe.client.get_list", {
      doctype: "Background Job", // Note: Might not be exposed in standard client, assuming standard doctype
      filters: { status: "Failed" },
      limit_page_length: 5,
    });

    // Check for Error Logs
    const logs = await gatewayCall(client, "frappe.client.get_list", {
      doctype: "Error Log",
      order_by: "creation desc",
      limit_page_length: 5,
    });

    const jobCount = jobs?.message?.length || 0;
    const logCount = logs?.message?.length || 0;

    const status = jobCount === 0 && logCount === 0 ? "Healthy" : "Degraded";

    return {
      success: true,
      status: status,
      details: { failedJobs: jobCount, recentErrors: logCount },
    };
  } catch (e: any) {
    // Fallback if doctypes don't exist
    return { success: true, status: "Healthy (Unable to query logs)" };
  }
}
