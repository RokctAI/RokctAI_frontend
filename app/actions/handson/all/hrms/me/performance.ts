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
import { PerformanceService } from "@/app/services/all/hrms/performance";

export async function getGoals() {
  const employeeId = await getCurrentEmployeeId();
  if (!employeeId) return [];

  try {
    return await PerformanceService.getGoals({ employee: employeeId });
  } catch (e) {
    console.error("Failed to fetch Goals", e);
    return [];
  }
}

export async function saveGoal(data: any) {
  const employeeId = await getCurrentEmployeeId();
  if (!employeeId) return { success: false, error: "Unauthorized" };

  try {
    let doc;
    if (data.name) {
      await PerformanceService.updateGoal(data.name, data);
      doc = { name: data.name, ...data };
    } else {
      doc = await PerformanceService.createGoal({
        ...data,
        employee: employeeId,
      });
    }
    revalidatePath("/handson/all/hrms/me/performance");
    return { success: true, data: doc };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getAppraisals() {
  const employeeId = await getCurrentEmployeeId();
  if (!employeeId) return [];

  try {
    return await PerformanceService.getAppraisals({ employee: employeeId });
  } catch (e) {
    console.error("Failed to fetch Appraisals", e);
    return [];
  }
}

export async function submitAppraisal(data: any) {
  const employeeId = await getCurrentEmployeeId();
  if (!employeeId) return { success: false, error: "Unauthorized" };

  try {
    let doc;
    if (data.name) {
      await PerformanceService.updateAppraisal(data.name, data);
      doc = { name: data.name, ...data };
    } else {
      doc = await PerformanceService.createAppraisal({
        ...data,
        employee: employeeId,
      });
    }
    revalidatePath("/handson/all/hrms/me/performance");
    return { success: true, data: doc };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
