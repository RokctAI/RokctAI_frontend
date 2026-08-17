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

import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getPendingReminders } from "@/db/queries";

import { getClient } from "@/app/lib/client";

export const revalidate = 0;

export async function GET(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const remindersPromise = getPendingReminders({ userId: session.user.id });

    // Fetch Unread Notifications from Frappe
    const client = await getClient();
    const notificationsPromise = (client as any).call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Notification Log",
        filters: {
          for_user: session.user.email,
          read: 0,
        },
        fields: [
          "name",
          "subject",
          "email_content",
          "type",
          "creation",
          "document_type",
          "document_name",
        ],
        order_by: "creation desc",
        limit_page_length: 5,
      },
    });

    const [reminders, notificationsRes] = await Promise.all([
      remindersPromise,
      notificationsPromise,
    ]);

    return NextResponse.json({
      reminders: reminders || [],
      notifications: notificationsRes?.message || [],
    });
  } catch (error) {
    console.error("Failed to fetch reminders/notifications", error);
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
