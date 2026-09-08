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
import { TimesheetService } from "@/app/services/all/projects/timesheets";

export async function getTimesheets() {
  try {
    return await TimesheetService.getList();
  } catch (e) {
    console.error("Failed to fetch Timesheets", e);
    return [];
  }
}

export async function createTimesheet(data: any) {
  try {
    const result = await TimesheetService.create(data);
    revalidatePath("/handson/all/projects");
    return { success: true, message: result };
  } catch (e: any) {
    console.error("Failed to create Timesheet", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}

export async function getActivityTypes() {
  try {
    return await TimesheetService.getActivityTypes();
  } catch (e) {
    return [];
  }
}

export async function createActivityType(data: any) {
  try {
    const result = await TimesheetService.createActivityType(data);
    return { success: true, message: result };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
