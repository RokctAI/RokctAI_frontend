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

// Tenant Action Actions

export async function getBillingStatus(data: { modelId?: string } = {}) {
  // In a multi-tenant setup, this often checks a specific Subscription doctype
  if (!(await verifySystemManager()))
    return { success: false, error: "Unauthorized" };

  const client = await getClient();
  try {
    // Assuming "Subscription" doctype (or generic placeholder)
    const sub = await gatewayCall(client, "frappe.client.get_list", {
        doctype: "Subscription", // Standard in ERPNext
        fields: ["name", "status", "next_payment_date", "plan"],
        limit_page_length: 1,
      });
    return {
      success: true,
      subscription: sub?.message?.[0] || "No active subscription found.",
    };
  } catch (e: any) {
    return { success: false, error: "Failed to fetch billing status." };
  }
}

export async function contactSupport(data: {
  subject: string;
  message: string;
  modelId?: string;
}) {
  if (!(await verifySystemManager()))
    return { success: false, error: "Unauthorized" };

  const client = await getClient();
  try {
    // Create an Issue or Support Ticket
    const response = await gatewayCall(client, "frappe.client.insert", {
        doc: {
          doctype: "Issue",
          subject: data.subject,
          description: data.message,
          raised_by: (await auth())?.user?.email,
        },
      });
    return { success: true, message: "Support ticket created." };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Failed to contact support.",
    };
  }
}

export async function getAvailableModels() {
  const client = await getClient();
  try {
    // Gateway cmd = manifest alias key minus "{app_name}." (agent module
    // manifest key: {app_name}.api.plan_builder.get_available_models — the
    // doubled file-segment form was collapsed on agent main).
    const res = await gatewayCall(
      client,
      "api.plan_builder.get_available_models",
    );
    if (res && res.message && (res.message.FREE || res.message.PAID)) {
      return { success: true, models: res.message };
    }
    return { success: false, error: "Invalid models data returned from backend." };
  } catch (e: any) {
    console.error("Failed to fetch available models from backend:", e);
    return { success: false, error: e?.message || "Failed to fetch available models." };
  }
}
