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
import { LogsService } from "@/app/services/control/rpanel/logs/logs";

export async function getLogStats(website: string) {
  try {
    const response = await LogsService.getLogStats(website);
    return response.message || response;
  } catch (error: any) {
    console.error("Error fetching log stats:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch log stats",
    };
  }
}

export async function getLogContent(
  website: string,
  logType: string,
  lines: number = 100,
) {
  try {
    const response = await LogsService.getLogContent(website, logType, lines);
    return response.message || response;
  } catch (error: any) {
    console.error("Error fetching log content:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch log content",
    };
  }
}

export async function clearLog(website: string, logType: string) {
  try {
    const response = await LogsService.clearLog(website, logType);

    revalidatePath(`/rpanel/websites/${website}/logs`);
    return response.message || response;
  } catch (error: any) {
    console.error("Error clearing log:", error);
    return { success: false, error: error.message || "Failed to clear log" };
  }
}
