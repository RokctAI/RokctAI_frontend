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

import { WorkflowService } from "@/app/services/control/workflows";
import type { WorkflowRule } from "@/app/services/control/workflows";
import { revalidatePath } from "next/cache";

/**
 * Fetches Global Workflow Rules.
 */
export async function getGlobalWorkflows(
  doctype?: string,
): Promise<WorkflowRule[]> {
  return WorkflowService.getGlobalWorkflows(doctype);
}

export async function applyGlobalWorkflows(doctype: string, data: any) {
  return WorkflowService.applyGlobalWorkflows(doctype, data);
}

/**
 * Save a Global Workflow Rule.
 */
export async function saveGlobalWorkflow(rule: WorkflowRule) {
  await WorkflowService.saveGlobalWorkflow(rule);
  revalidatePath("/handson/control/workflows");
  return { success: true };
}

export async function deleteGlobalWorkflow(name: string) {
  await WorkflowService.deleteGlobalWorkflow(name);
  revalidatePath("/handson/control/workflows");
  return { success: true };
}

export async function seedWorkflows() {
  return { success: true, message: "Workflows seeded" };
}
