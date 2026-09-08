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
import { PerformanceService } from "@/app/services/all/hrms/performance";

// Goals converged onto the canonical domain module (see
// app/actions/domains/hr/goals.ts and app/lib/action-kit.ts). These thin
// delegates keep the existing import path working for the hands-on pages.
// (Async wrappers rather than `export ... from` because "use server"
// modules may only export async functions.)
import * as goalsDomain from "@/app/actions/domains/hr/goals";

export async function getAllGoals() {
  return goalsDomain.getAllGoals();
}

export async function createGoal(data: any) {
  return goalsDomain.createGoal(data);
}

export async function updateGoal(name: string, data: any) {
  return goalsDomain.updateGoal(name, data);
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
