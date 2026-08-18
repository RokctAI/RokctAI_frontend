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

// Platform Level Control Actions

export async function broadcastAnnouncement(data: {
  subject: string;
  message: string;
  modelId?: string;
}) {
  if (!(await verifySystemManager()))
    return { success: false, error: "Unauthorized" };

  const client = await getClient();

  try {
    const response = await gatewayCall(client, "frappe.client.insert", {
      doc: {
        doctype: "Announcement",
        subject: data.subject,
        description: data.message,
        starts_on: new Date().toISOString().split("T")[0],
        is_public: 1,
      },
    });
    return { success: true, message: "Announcement broadcasted successfully." };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

export async function getGlobalSettings(data: { modelId?: string } = {}) {
  if (!(await verifySystemManager()))
    return { success: false, error: "Unauthorized" };

  const client = await getClient();

  try {
    const settings = await client.call({
      method: "frappe.client.get_singles",
      args: { doctype: "System Settings" },
    });
    // Filter sensitive data? For System Manager it is fine.
    return { success: true, settings: settings };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}
