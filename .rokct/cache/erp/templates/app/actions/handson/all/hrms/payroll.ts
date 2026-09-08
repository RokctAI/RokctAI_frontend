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
import { PayrollService } from "@/app/services/all/hrms/payroll";

export async function getSalarySlips() {
  if (!(await verifyHrRole())) return [];
  try {
    return await PayrollService.getSalarySlips();
  } catch (e) {
    console.error("Failed to fetch Salary Slips", e);
    return [];
  }
}

export async function getSalarySlip(name: string) {
  if (!(await verifyHrRole())) return null;
  try {
    return await PayrollService.getSalarySlip(name);
  } catch (e) {
    return null;
  }
}

export async function getSalaryStructures() {
  if (!(await verifyHrRole())) return [];
  try {
    return await PayrollService.getSalaryStructures();
  } catch (e) {
    return [];
  }
}

export async function createSalarySlip(data: any) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    const result = await PayrollService.createSalarySlip(data);
    revalidatePath("/handson/all/hrms/payroll");
    return { success: true, message: "Salary Slip created", name: result.name };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Error creating Salary Slip",
    };
  }
}
