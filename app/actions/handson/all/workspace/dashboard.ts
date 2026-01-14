"use server";

import { getClient } from "@/app/lib/client";
import { revalidatePath } from "next/cache";

export type WorkItemType = 'todo' | 'task' | 'note';

interface WorkItem {
    name: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
    type: WorkItemType;
    [key: string]: any;
}

/**
 * Unified action to fetch work items (Todo, Task, or Note)
 * @param type The type of work item to fetch
 */
export async function getWorkItems(type: WorkItemType): Promise<WorkItem[]> {
    const client = await getClient();
    let docType = "";
    let fields: string[] = ["name"];

    switch (type) {
        case 'todo':
            docType = "ToDo";
            fields = ["name", "description", "status", "priority", "date as due_date", "reference_type", "reference_name"];
            break;
        case 'task':
            docType = "Task"; // ERPNext DocType
            // 'project' is often the main link, but there are others. 
            // In ERPNext, Task links to Project but can also link to others via custom fields or parent. 
            // Standard Task has 'project' field. 
            fields = ["name", "subject as description", "status", "priority", "exp_end_date as due_date", "project as reference_name", "'Project' as reference_type"];
            break;
        case 'note':
            docType = "Note";
            fields = ["name", "title as description", "public"]; // Notes don't always have status/priority
            break;
    }

    try {
        const response = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: docType,
                fields: fields,
                limit_page_length: 50,
                order_by: "creation desc"
            }
        });

        const items = response?.message || [];

        // Normalize and tag items with their type
        return items.map((item: any) => ({
            ...item,
            type: type,
            // Fallbacks for consistent UI
            status: item.status || 'Open',
            priority: item.priority || 'Medium'
        }));

    } catch (error) {
        console.error(`Failed to fetch ${type}:`, error);
        return [];
    }
}

/**
 * Unified action to create work items
 * @param type 'todo' | 'task' | 'note'
 * @param data The data payload depending on type
 */
export async function createWorkItem(type: WorkItemType, data: any) {
    const client = await getClient();
    let doc: any = { doctype: "" };

    switch (type) {
        case 'todo':
            doc = {
                doctype: "ToDo",
                description: data.description,
                status: data.status || "Open",
                priority: data.priority || "Medium",
                date: data.due_date
            };
            break;
        case 'task':
            doc = {
                doctype: "Task",
                subject: data.description, // Maps description to subject
                status: data.status || "Open",
                priority: data.priority || "Medium",
                exp_end_date: data.due_date
            };
            break;
        case 'note':
            doc = {
                doctype: "Note",
                title: data.description, // Maps description to title
                public: true
            };
            break;
    }

    try {
        const response = await client.call({
            method: "frappe.client.insert",
            args: { doc: doc }
        });
        revalidatePath("/handson/all/workspace");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error(`Failed to create ${type}`, e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
