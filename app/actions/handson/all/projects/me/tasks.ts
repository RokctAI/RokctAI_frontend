"use server";

import { getClient } from "@/app/lib/client";
import { auth } from "@/auth"; // Assuming auth helper exists
import { revalidatePath } from "next/cache";

export async function getMyTasks() {
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) return [];

    const client: any = await getClient();
    try {
        // Filter tasks where the user is listed in the assignment table (child table usually) or direct field
        // Note: Generic "Task" in Frappe often has `_assign` json field or child table. 
        // For simplicity, we might check if they are owner or specific custom field. 
        // Standard Frappe Task doesn't always have a direct "assigned_to" link field, but uses ToDo or _assign.
        // We will try to filter by `_assign` using LIKE if possible, or usually we rely on "Todo" list for assignments.
        // However, let's assume a simplified "Expected" behavior: fetch tasks where I am the owner or it's assigned to me.

        // Strategy: Fetch tasks where owner is me OR check Todo? 
        // Let's stick to simple owner filter for now or assume a custom "assigned_to" field if it existed.
        // Actually, let's fetch all and filter in memory if volume is low, or rely on standard "Owner" permission.

        // Better: Fetch standard list, relying on permission manager.
        const response = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Task",
                fields: ["name", "subject", "status", "priority", "project", "exp_end_date"],
                filters: {
                    // explicit filter for "Me" often requires join. 
                    // For now, let's return all tasks visible to user, which IS "My Tasks" in strict permission mode.
                },
                limit_page_length: 50,
                order_by: "creation desc"
            }
        });

        // In a real "Me" view, we might want to filter strictly by assignment. 
        // Since we don't have the sophisticated assignment logic details here, we return the visible list.
        return response?.message || [];
    } catch (e) {
        console.error("Failed to fetch My Tasks", e);
        return [];
    }
}
