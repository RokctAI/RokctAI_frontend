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
import { revalidatePath } from "next/cache";

export interface EventData {
  subject: string;
  starts_on: string;
  description?: string;
  status?: "Open" | "Closed" | "Cancelled";
  event_type?: "Private" | "Public";
  all_day?: 0 | 1;
}

export async function createEvent(data: EventData) {
  const client = await getClient();
  try {
    const response = await (client as any).call({
      method: "frappe.client.insert",
      args: { doc: { doctype: "Event", ...data } },
    });
    revalidatePath("/handson/all/communication/events");
    return { success: true, message: response?.message };
  } catch (e: any) {
    console.error("Failed to create Event", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}

export async function getEvents(filters?: any) {
  const client = await getClient();
  try {
    const response = await (client as any).call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Event",
        fields: [
          "name",
          "subject",
          "starts_on",
          "status",
          "event_type",
          "description",
          "all_day",
        ],
        filters: filters || {},
        limit_page_length: 100,
        order_by: "starts_on asc",
      },
    });
    return response?.message || [];
  } catch (e) {
    console.error("Failed to fetch Events", e);
    return [];
  }
}

export async function deleteEvent(name: string) {
  const client = await getClient();
  try {
    await (client as any).call({
      method: "frappe.client.delete",
      args: { doctype: "Event", name: name },
    });
    revalidatePath("/handson/all/communication/events");
    return { success: true };
  } catch (e) {
    console.error(`Failed to delete Event ${name}`, e);
    return { success: false };
  }
}
