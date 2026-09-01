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
import { DatabasesService } from "@/app/services/control/rpanel/databases/databases";

export async function getDatabases(clientName?: string) {
  try {
    const res = await DatabasesService.getClientDatabases(clientName);
    return { message: res.message || res };
  } catch (e: any) {
    return { message: { success: false, error: e.message } };
  }
}

export async function updateDatabasePassword(
  websiteName: string,
  newPassword: string,
) {
  try {
    const res = await DatabasesService.updateDatabasePassword(
      websiteName,
      newPassword,
    );

    if (res.exc) throw new Error(JSON.stringify(res.exc));

    revalidatePath("/rpanel/databases");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
