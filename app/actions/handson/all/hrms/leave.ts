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
import { LeaveService } from "@/app/services/all/hrms/leave";
import type { LeaveApplicationData } from "@/app/services/all/hrms/leave";

export async function getLeaveTypes() {
  if (!(await verifyHrRole())) return [];
  try {
    return await LeaveService.getLeaveTypes();
  } catch (e) {
    return [];
  }
}

export async function getLeaveAllocations(employee: string) {
  if (!(await verifyHrRole())) return [];
  try {
    return await LeaveService.getLeaveAllocations(employee);
  } catch (e) {
    return [];
  }
}

export async function getHolidays(year?: string) {
  if (!(await verifyHrRole())) return [];
  try {
    return await LeaveService.getHolidays(year);
  } catch (e) {
    return [];
  }
}

export async function getLeaveApplications() {
  if (!(await verifyHrRole())) return [];
  try {
    return await LeaveService.getLeaveApplications();
  } catch (e) {
    console.error("Failed to fetch Leave Applications", e);
    return [];
  }
}

export async function createLeaveApplication(data: any) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    await LeaveService.createLeaveApplication(data);

    revalidatePath("/handson/all/hrms/leave");
    revalidatePath("/handson/all/hrms/me/leave");
    return { success: true, message: "Leave Application created" };
  } catch (e: any) {
    return {
      success: false,
      error: e.message || "Failed to create leave application",
    };
  }
}
