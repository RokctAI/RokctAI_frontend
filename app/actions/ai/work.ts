"use server";

import { getClient } from "@/app/lib/client";
import { auth } from "@/app/(auth)/auth";

export async function getMyProjects(data: { modelId?: string } = {}) {
    // GUARDRAIL: Only active employees can access work management.
    const { verifyActiveEmployee } = await import("@/app/lib/roles");
    if (!await verifyActiveEmployee()) return { success: false, error: "Access Restricted: Account is not active." };


    const session = await auth();
    const client = await getClient();

    try {
        const projects = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Project",
                filters: { status: "Open" }, // Todo: Filter by _user_tags or team?
                fields: ["name", "project_name", "status", "percent_complete", "expected_end_date"],
                limit_page_length: 10
            }
        });

        return { success: true, projects: projects?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to fetch projects" };
    }
}

export async function getMyTasks(data: { modelId?: string } = {}) {
    // GUARDRAIL: Only active employees can access tasks.
    const { verifyActiveEmployee } = await import("@/app/lib/roles");
    if (!await verifyActiveEmployee()) return { success: false, error: "Access Restricted: Account is not active." };

    const session = await auth();
    const client = await getClient();

    try {
        const tasks = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Task",
                filters: { status: "Open" }, // Filter by user assignment in real world
                fields: ["name", "subject", "status", "priority", "exp_end_date", "project"],
                limit_page_length: 10,
                order_by: "exp_end_date asc"
            }
        });

        return { success: true, tasks: tasks?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to fetch tasks" };
    }
}
