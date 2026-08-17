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
import { PerformanceService } from "@/app/services/all/hrms/performance";

export async function getAllGoals() {
  if (!(await verifyHrRole())) return [];
  try {
    return await PerformanceService.getGoals();
  } catch (e) {
    console.error("Failed to fetch Goals", e);
    return [];
  }
}

export async function createGoal(data: any) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    const result = await PerformanceService.createGoal(data);
    revalidatePath("/handson/all/hrms/performance");
    return {
      success: true,
      message: "Goal created successfully",
      data: result,
    };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to create Goal" };
  }
}

export async function updateGoal(name: string, data: any) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    await PerformanceService.updateGoal(name, data);
    revalidatePath("/handson/all/hrms/performance");
    return { success: true, message: "Goal updated successfully" };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update Goal" };
  }
}

export async function getAllAppraisals() {
  if (!(await verifyHrRole())) return [];
  try {
    return await PerformanceService.getAppraisals();
  } catch (e) {
    console.error("Failed to fetch Appraisals", e);
    return [];
  }
}

export async function createAppraisal(data: any) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    const result = await PerformanceService.createAppraisal(data);
    revalidatePath("/handson/all/hrms/performance");
    return {
      success: true,
      message: "Appraisal created successfully",
      data: result,
    };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to create Appraisal" };
  }
}
