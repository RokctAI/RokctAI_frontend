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
