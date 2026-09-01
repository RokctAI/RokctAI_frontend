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
import { CronService } from "@/app/services/control/rpanel/cron/cron";

export async function getCronJobs(website?: string) {
  try {
    const response = await CronService.getCronJobs(website);
    return response.message || response;
  } catch (error: any) {
    console.error("Error fetching cron jobs:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch cron jobs",
    };
  }
}

export async function createCronJob(data: any) {
  try {
    const response = await CronService.createCronJob(data);
    revalidatePath("/rpanel/cron");
    return response.message || response;
  } catch (error: any) {
    console.error("Error creating cron job:", error);
    return {
      success: false,
      error: error.message || "Failed to create cron job",
    };
  }
}

export async function updateCronJob(name: string, data: any) {
  try {
    const response = await CronService.updateCronJob(name, data);
    revalidatePath("/rpanel/cron");
    return response.message || response;
  } catch (error: any) {
    console.error("Error updating cron job:", error);
    return {
      success: false,
      error: error.message || "Failed to update cron job",
    };
  }
}

export async function deleteCronJob(name: string) {
  try {
    const response = await CronService.deleteCronJob(name);
    revalidatePath("/rpanel/cron");
    return response.message || response;
  } catch (error: any) {
    console.error("Error deleting cron job:", error);
    return {
      success: false,
      error: error.message || "Failed to delete cron job",
    };
  }
}
