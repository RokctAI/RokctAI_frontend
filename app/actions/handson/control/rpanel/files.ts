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

import { platformCall } from "@/app/services/base/platform-gateway";

/**
 * Control-plane calls through the ONE platform gateway (ADR-005, a
 * `{cmd, payload}` POST), never a per-method URL.
 *
 * They had to move: `FrappeApp.call()` takes ZERO arguments and returns a
 * `FrappeCall` (frappe-js-sdk 1.12.0, `lib/frappe_app/index.d.ts`), so
 * `client.call("rpanel.…", {…})` discarded both arguments, issued no HTTP
 * request, and handed back an SDK builder object — the file manager showed
 * an empty directory and a delete reported success without deleting
 * anything. The compiler was already saying so: these two lines were
 * `TS2554: Expected 0 arguments, but got 2` on `main`.
 *
 * The explicit `baseUrl` keeps these pointed at the control plane, which
 * is what `getControlClient()` did by deliberately ignoring the session's
 * tenant site. One behavioural note: `getControlClient()` threw
 * `Unauthorized` before sending anything when there was no session; now an
 * unauthenticated call fails at the gateway instead, landing in the same
 * catch and returning the same `{ success: false }` shape with a different
 * message.
 */
export async function getFiles(website: string, path: string) {
  try {
    const res = await platformCall<Record<string, any>>(
      "rpanel.hosting.file_manager.get_file_list",
      { website_name: website, path: path },
      {
        baseUrl:
          process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.ROKCT_BASE_URL,
        throwOnError: true,
      },
    );
    // `platformCall` already unwrapped Frappe's `message` envelope.
    return { success: true, data: res };
  } catch (e: any) {
    console.error("Failed to fetch files", e);
    return { success: false, error: e.message || "Unknown error" };
  }
}

export async function deleteFile(website: string, filePath: string) {
  try {
    await platformCall(
      "rpanel.hosting.file_manager.delete_file",
      { website_name: website, file_path: filePath },
      {
        baseUrl:
          process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.ROKCT_BASE_URL,
        throwOnError: true,
      },
    );
    return { success: true };
  } catch (e: any) {
    console.error("Failed to delete file", e);
    return { success: false, error: e.message || "Unknown error" };
  }
}
