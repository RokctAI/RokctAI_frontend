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
import { ShiftService } from "@/app/services/all/hrms/shifts";
import type { ShiftAssignmentData } from "@/app/services/all/hrms/shifts";

export async function getShiftTypes() {
  if (!(await verifyHrRole())) return [];
  try {
    return await ShiftService.getShiftTypes();
  } catch (e) {
    return [];
  }
}

export async function getShiftAssignments() {
  if (!(await verifyHrRole())) return [];
  try {
    return await ShiftService.getShiftAssignments();
  } catch (e) {
    return [];
  }
}

export async function createShiftAssignment(data: ShiftAssignmentData) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    const result = await ShiftService.createAssignment(data);
    revalidatePath("/handson/all/hrms/shift");
    return {
      success: true,
      message: "Shift Assigned successfully",
      name: result.name,
    };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to assign shift" };
  }
}
