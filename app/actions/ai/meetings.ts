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

export async function getMyEvents(data: { modelId?: string } = {}) {
  const { verifyActiveEmployee } = await import("@/app/lib/roles");
  if (!(await verifyActiveEmployee()))
    return { success: false, error: "Access Restricted" };

  const session = await auth();
  const client = await getClient();

  try {
    const events = await gatewayCall(client, "frappe.client.get_list", {
        doctype: "Event",
        filters: {
          starts_on: [">=", new Date().toISOString().split("T")[0]],
          status: "Open",
        },
        fields: ["name", "subject", "starts_on", "event_type"],
        order_by: "starts_on asc",
        limit_page_length: 5,
      });

    return { success: true, events: events?.message || [] };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}
