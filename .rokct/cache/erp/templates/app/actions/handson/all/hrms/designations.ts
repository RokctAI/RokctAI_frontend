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
import {
  DesignationService,
  type DesignationData,
} from "@/app/services/all/hrms/designations";

export type { DesignationData };

export async function getDesignations() {
  if (!(await verifyHrRole())) return [];
  try {
    return await DesignationService.getList();
  } catch (e) {
    console.error("Failed to fetch Designations", e);
    return [];
  }
}

export async function createDesignation(data: DesignationData) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    const result = await DesignationService.create(data);
    revalidatePath("/handson/all/hrms/me/employees");
    return { success: true, message: result };
  } catch (e: any) {
    console.error("Failed to create Designation", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}
