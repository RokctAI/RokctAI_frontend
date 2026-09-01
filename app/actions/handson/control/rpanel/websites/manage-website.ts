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

import { revalidatePath } from "next/cache";
import { WebsitesService } from "@/app/services/control/rpanel/websites/websites";

export async function deleteWebsite(websiteName: string) {
  try {
    const res = await WebsitesService.deleteWebsite(websiteName);

    // Frappe delete usually returns "ok" or empty on success, check for error in response structure if json returned
    // But fetch wrapper returns json.
    if (res && res.exc) throw new Error(JSON.stringify(res.exc));

    revalidatePath("/rpanel/websites");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

export async function issueSSL(websiteName: string) {
  try {
    const res = await WebsitesService.updateWebsite(websiteName, {
      ssl_status: "Pending",
    });

    if (res.exc) throw new Error(JSON.stringify(res.exc));

    revalidatePath("/rpanel/websites");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateWebsite(websiteName: string, data: any) {
  try {
    const res = await WebsitesService.updateWebsite(websiteName, data);

    if (res.exc) throw new Error(JSON.stringify(res.exc));

    revalidatePath("/rpanel/websites");
    return { success: true, data: res.data };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
