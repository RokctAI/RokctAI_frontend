/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
import { BackupsService } from "@/app/services/control/rpanel/backups/backups";

export async function getBackups(website?: string) {
  try {
    const response = await BackupsService.getBackups(website);
    return response.message || response;
  } catch (error: any) {
    console.error("Error fetching backups:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch backups",
    };
  }
}

export async function createBackup(
  website: string,
  backup_type: string = "Full",
) {
  try {
    const response = await BackupsService.createBackup(website, backup_type);
    revalidatePath("/rpanel/backups");
    return response.message || response;
  } catch (error: any) {
    console.error("Error creating backup:", error);
    return {
      success: false,
      error: error.message || "Failed to create backup",
    };
  }
}

export async function deleteBackup(backup_id: string) {
  try {
    const response = await BackupsService.deleteBackup(backup_id);
    revalidatePath("/rpanel/backups");
    return response.message || response;
  } catch (error: any) {
    console.error("Error deleting backup:", error);
    return {
      success: false,
      error: error.message || "Failed to delete backup",
    };
  }
}

export async function restoreBackup(backup_id: string) {
  try {
    const response = await BackupsService.restoreBackup(backup_id);
    revalidatePath("/rpanel/backups");
    return response.message || response;
  } catch (error: any) {
    console.error("Error restoring backup:", error);
    return {
      success: false,
      error: error.message || "Failed to restore backup",
    };
  }
}
