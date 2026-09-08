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
  AttendanceService,
  type AttendanceData,
} from "@/app/services/all/hrms/attendance";

export type { AttendanceData };

export async function getAttendanceList() {
  if (!(await verifyHrRole())) return [];
  try {
    return await AttendanceService.getList();
  } catch (e) {
    console.error("Failed to fetch Attendance", e);
    return [];
  }
}

export async function getTodayAttendance(employee: string) {
  try {
    return await AttendanceService.getTodayAttendance(employee);
  } catch (e) {
    return null;
  }
}

export async function checkIn(data: {
  employee: string;
  company: string;
  timestamp: string;
}) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    const result = await AttendanceService.checkIn(
      data.employee,
      data.company,
      data.timestamp,
    );

    revalidatePath("/handson/all/hrms/attendance");
    revalidatePath("/handson/all/hrms/me/attendance");
    return { success: true, message: "Checked In successfully", data: result };
  } catch (e: any) {
    return { success: false, error: e?.message || "Check-in failed" };
  }
}

export async function checkOut(data: { employee: string; timestamp: string }) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    await AttendanceService.checkOut(data.employee, data.timestamp);

    revalidatePath("/handson/all/hrms/attendance");
    revalidatePath("/handson/all/hrms/me/attendance");
    return { success: true, message: "Checked Out successfully" };
  } catch (e: any) {
    return { success: false, error: e?.message || "Check-out failed" };
  }
}
