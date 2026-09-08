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
