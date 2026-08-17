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
