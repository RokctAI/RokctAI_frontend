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
