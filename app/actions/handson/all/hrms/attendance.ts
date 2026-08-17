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
