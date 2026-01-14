"use server";

import { getClient } from "@/app/lib/client";
import { getCurrentEmployeeId } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";

export async function getMyTimesheets() {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return [];

    const client = await getClient();
    try {
        const response = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Timesheet",
                filters: { employee: employeeId },
                fields: ["name", "employee_name", "total_hours", "status", "start_date"],
                limit_page_length: 50,
                order_by: "creation desc"
            }
        });
        return response?.message || [];
    } catch (e) {
        console.error("Failed to fetch My Timesheets", e);
        return [];
    }
}

export async function createMyTimesheet(data: any) {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return { success: false, error: "Unauthorized" };

    const client = await getClient();
    try {
        const response = await client.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Timesheet",
                    employee: employeeId,
                    ...data
                }
            }
        });
        revalidatePath("/handson/all/projects/me/timesheets"); // Hypothetical path
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error("Failed to create My Timesheet", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
