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
import { getCurrentEmployeeId } from "@/app/lib/roles";
import {
  EmployeeService,
  EmployeeData,
} from "@/app/services/all/hrms/employees";
import { EmployeeProfileSchema, EmployeeProfileData } from "./types";

export async function getMyProfile() {
  const employeeId = await getCurrentEmployeeId();
  if (!employeeId) return null;

  try {
    return await EmployeeService.get(employeeId);
  } catch (e) {
    return null;
  }
}

export async function updateMyProfile(data: Partial<EmployeeProfileData>) {
  const employeeId = await getCurrentEmployeeId();
  if (!employeeId) return { success: false, error: "Unauthorized" };

  try {
    await EmployeeService.update(employeeId, data as Partial<EmployeeData>);
    revalidatePath("/handson/all/hrms/me/employees");
    return { success: true, message: "Profile updated successfully" };
  } catch (e: any) {
    console.error("Update Profile Error:", e);
    return {
      success: false,
      error:
        e?.message ||
        "Failed to update profile. Please ensure ID and Bank details are valid.",
    };
  }
}
