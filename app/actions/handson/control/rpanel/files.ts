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

export async function getFiles(website: string, path: string) {
  try {
    const client = await getControlClient();
    const res = await client.call("rpanel.hosting.file_manager.get_file_list", {
      website_name: website,
      path: path,
    });
    return { success: true, data: res.message };
  } catch (e: any) {
    console.error("Failed to fetch files", e);
    return { success: false, error: e.message || "Unknown error" };
  }
}

export async function deleteFile(website: string, filePath: string) {
  try {
    const client = await getControlClient();
    await client.call("rpanel.hosting.file_manager.delete_file", {
      website_name: website,
      file_path: filePath,
    });
    return { success: true };
  } catch (e: any) {
    console.error("Failed to delete file", e);
    return { success: false, error: e.message || "Unknown error" };
  }
}
