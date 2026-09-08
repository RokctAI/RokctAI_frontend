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
