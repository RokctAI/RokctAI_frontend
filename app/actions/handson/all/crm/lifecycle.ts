"use server";

import { getClient } from "@/app/lib/client";
import { revalidatePath } from "next/cache";
import { verifyCrmRole } from "@/app/lib/roles";

// --- Company Policy ---

export async function getPolicies() {
    if (!await verifyCrmRole()) return [];
    const frappe = await getClient();
    return (frappe.db() as any).get_list("Company Policy", {
        fields: ["name", "title", "policy_type", "date"],
        order_by: "date desc"
    });
}

export async function getPolicy(name: string) {
    if (!await verifyCrmRole()) return null;
    const frappe = await getClient();
    return (frappe.db() as any).get_doc("Company Policy", name);
}

export async function createPolicy(data: any) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    const frappe = await getClient();
    const doc = await (frappe.db() as any).create_doc("Company Policy", data);
    revalidatePath("/handson/all/hr/lifecycle/policy");
    return doc;
}

// --- Employee Warning ---

export async function getWarnings() {
    if (!await verifyCrmRole()) return [];
    const frappe = await getClient();
    return (frappe.db() as any).get_list("Employee Warning", {
        fields: ["name", "employee", "warning_date", "warning_type", "subject"],
        order_by: "warning_date desc"
    });
}

export async function createWarning(data: any) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    const frappe = await getClient();
    const doc = await (frappe.db() as any).create_doc("Employee Warning", data);
    revalidatePath("/handson/all/hr/lifecycle/warning");
    return doc;
}

// --- Employee Grievance ---

// --- Employee Grievance ---

export async function getGrievanceTypes() {
    const frappe = await getClient();
    return (frappe.db() as any).get_list("Grievance Type", {
        fields: ["name", "description"],
        limit_page_length: 100
    });
}

export async function getGrievances() {
    if (!await verifyCrmRole()) return [];
    const frappe = await getClient();
    return (frappe.db() as any).get_list("Employee Grievance", {
        fields: ["name", "raised_by", "employee_name", "date", "subject", "status", "grievance_type"],
        order_by: "date desc"
    });
}

export async function updateGrievance(name: string, data: any) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    const frappe = await getClient();
    const doc = await (frappe.db() as any).update_doc("Employee Grievance", name, data);
    revalidatePath("/handson/all/hr/lifecycle/complaint");
    return doc;
}

export async function createGrievance(data: any) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    const frappe = await getClient();
    // Map frontend fields to DocType fields
    const payload = {
        subject: data.subject,
        raised_by: data.employee, // Frontend sends 'employee' ID (email or ID)
        date: data.grievance_date,
        description: data.description,
        grievance_type: data.grievance_type,
        grievance_against_party: "Employee", // defaulting to Employee for simplicity
        grievance_against: data.grievance_against, // ID of the accused employee
        status: "Open"
    };

    const doc = await (frappe.db() as any).create_doc("Employee Grievance", payload);
    revalidatePath("/handson/all/hr/lifecycle/complaint");
    return doc;
}
