/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
import { EmployeeService } from "@/app/services/all/hrms/employees";
import type { EmployeeData } from "@/app/services/all/hrms/employees";

export async function getEmployees() {
  if (!(await verifyHrRole())) return [];
  try {
    return await EmployeeService.getList();
  } catch (e) {
    console.error("Failed to fetch Employees", e);
    return [];
  }
}

export async function getEmployee(name: string) {
  if (!(await verifyHrRole())) return null;
  try {
    return await EmployeeService.get(name);
  } catch (e) {
    console.error(`Failed to fetch Employee ${name}`, e);
    return null;
  }
}

export async function createEmployee(data: EmployeeData) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    const result = await EmployeeService.create(data);
    revalidatePath("/handson/all/hrms/me/employees");
    return { success: true, message: result };
  } catch (e: any) {
    console.error("Failed to create Employee", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}

export async function updateEmployee(
  name: string,
  data: Partial<EmployeeData>,
) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    const result = await EmployeeService.update(name, data);
    revalidatePath("/handson/all/hrms/me/employees");
    return { success: true, message: result };
  } catch (e: any) {
    console.error(`Failed to update Employee ${name}`, e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}
