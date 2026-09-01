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

export async function updateUserProfile(
  email: string,
  data: {
    first_name?: string;
    last_name?: string;
    gender?: string;
    birth_date?: string;
  },
) {
  const client = await getClient();
  try {
    const response = await (client as any).call({
      method: "frappe.client.set_value",
      args: {
        doctype: "User",
        name: email,
        fieldname: data,
      },
    });
    return { success: true, message: response?.message };
  } catch (e: any) {
    console.error("Failed to update User Profile", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}
