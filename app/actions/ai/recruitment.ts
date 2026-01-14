"use server";

import { getClient } from "@/app/lib/client";
import { auth } from "@/app/(auth)/auth";
import { verifyHrRole } from "@/app/lib/roles";

export async function getJobApplicants(data: { modelId?: string } = {}) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };

    const client = await getClient();

    try {
        const applicants = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Job Applicant",
                filters: { status: "Open" },
                fields: ["name", "applicant_name", "job_title", "status", "email_id"],
                order_by: "creation desc",
                limit_page_length: 10
            }
        });

        return { success: true, applicants: applicants?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to fetch applicants" };
    }
}

export async function getJobOpenings(data: { modelId?: string } = {}) {
    // Internal Jobs only for active employees
    const { verifyActiveEmployee } = await import("@/app/lib/roles");
    if (!await verifyActiveEmployee()) return { success: false, error: "Access Restricted" };

    const client = await getClient();

    try {
        const jobs = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Job Opening",
                filters: { status: "Open" },
                fields: ["name", "job_title", "department", "status"],
                limit_page_length: 10
            }
        });

        return { success: true, jobs: jobs?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}
