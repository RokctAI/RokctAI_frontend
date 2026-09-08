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
import { verifyHrRole } from "@/app/lib/roles";
import {
  AdvanceService,
  type EmployeeAdvanceData,
} from "@/app/services/all/hrms/advances";

export type { EmployeeAdvanceData };

export async function getEmployeeAdvances() {
  if (!(await verifyHrRole())) return [];
  try {
    return await AdvanceService.getList();
  } catch (e) {
    return [];
  }
}

export async function createEmployeeAdvance(data: EmployeeAdvanceData) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    const result = await AdvanceService.create(data);
    revalidatePath("/handson/all/hrms/advances");
    return {
      success: true,
      message: "Employee Advance created",
      name: result.name,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Failed to create Employee Advance",
    };
  }
}
