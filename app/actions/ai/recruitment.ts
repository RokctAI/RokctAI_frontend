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
import { verifyHrRole } from "@/app/lib/roles";
import { gatewayCall } from "@/app/lib/gateway-rpc";

export async function getJobApplicants(data: { modelId?: string } = {}) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };

  const client = await getClient();

  try {
    const applicants = await gatewayCall(client, "frappe.client.get_list", {
        doctype: "Job Applicant",
        filters: { status: "Open" },
        fields: ["name", "applicant_name", "job_title", "status", "email_id"],
        order_by: "creation desc",
        limit_page_length: 10,
      });

    return { success: true, applicants: applicants?.message || [] };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Failed to fetch applicants",
    };
  }
}

export async function getJobOpenings(data: { modelId?: string } = {}) {
  // Internal Jobs only for active employees
  const { verifyActiveEmployee } = await import("@/app/lib/roles");
  if (!(await verifyActiveEmployee()))
    return { success: false, error: "Access Restricted" };

  const client = await getClient();

  try {
    const jobs = await gatewayCall(client, "frappe.client.get_list", {
        doctype: "Job Opening",
        filters: { status: "Open" },
        fields: ["name", "job_title", "department", "status"],
        limit_page_length: 10,
      });

    return { success: true, jobs: jobs?.message || [] };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}
