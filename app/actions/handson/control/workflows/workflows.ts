"use server";

import { WorkflowService, WorkflowRule } from "@/app/services/control/workflows";
import { revalidatePath } from "next/cache";

export type { WorkflowRule };

/**
 * Fetches Global Workflow Rules.
 */
export async function getGlobalWorkflows(doctype?: string): Promise<WorkflowRule[]> {
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
