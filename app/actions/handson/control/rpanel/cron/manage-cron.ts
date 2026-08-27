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
