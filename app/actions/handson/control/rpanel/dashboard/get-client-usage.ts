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

import { getControlClient } from "@/app/lib/client";

export async function getClientUsage() {
  try {
    const client = await getControlClient();
    const response = await client.call(
      "rpanel.hosting.doctype.hosting_client.hosting_client.get_client_usage",
    );
    return response.message || response;
  } catch (error: any) {
    console.error("Error fetching client usage:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch client usage",
    };
  }
}
