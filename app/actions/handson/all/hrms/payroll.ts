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
