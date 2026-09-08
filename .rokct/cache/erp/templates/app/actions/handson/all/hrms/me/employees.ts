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
