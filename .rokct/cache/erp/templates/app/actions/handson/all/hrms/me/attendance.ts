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
import { getCurrentEmployeeId } from "@/app/lib/roles";
import { AttendanceService } from "@/app/services/all/hrms/attendance";
import type { AttendanceData } from "@/app/services/all/hrms/attendance";

export type { AttendanceData };

export async function getMyAttendanceList() {
  const employeeId = await getCurrentEmployeeId();
  if (!employeeId) return [];

  try {
    return await AttendanceService.getList({ employee: employeeId });
  } catch (e) {
    return [];
  }
}

export async function markMyAttendance(data: AttendanceData) {
  const employeeId = await getCurrentEmployeeId();
  if (!employeeId)
    return { success: false, error: "Employee record not found" };

  try {
    await AttendanceService.create({
      ...data,
      employee: employeeId,
    });
    revalidatePath("/handson/all/hrms/me/attendance");
    return { success: true, message: "Attendance marked" };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to mark attendance" };
  }
}
