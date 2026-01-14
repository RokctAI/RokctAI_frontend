"use server";

import { getClient } from "@/app/lib/client";
import { auth } from "@/app/(auth)/auth";
import { verifyCrmRole } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";

// --- DEALS ---

export async function getMyDeals(data: { modelId?: string } = {}) {
    const session = await auth();
    const client = await getClient();

    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };

    try {
        const deals = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Opportunity",
                filters: {
                    status: ["in", ["Open", "Quotation", "Replied"]],
                },
                fields: ["name", "party_name", "opportunity_amount", "status", "expected_closing", "probability"],
                order_by: "creation desc",
                limit_page_length: 10
            },
            headers: { 'X-AI-Action': 'true' }
        });

        return { success: true, deals: deals?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to fetch deals" };
    }
}

// --- LEADS ---

export async function getMyLeads(data: { modelId?: string } = {}) {
    const session = await auth();
    const client = await getClient();

    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };

    try {
        const leads = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "CRM Lead",
                filters: { status: ["!=", "Converted"] },
                fields: ["name", "lead_name", "company_name", "status", "email_id", "mobile_no", "id_number", "kyc_status", "first_name", "last_name", "organization"],
                order_by: "creation desc",
                limit_page_length: 10
            },
            headers: { 'X-AI-Action': 'true' }
        });

        return { success: true, leads: leads?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to fetch leads" };
    }
}

export async function createAiLead(data: { lead_name: string; organization?: string; email_id?: string; mobile_no?: string; id_number?: string; modelId?: string }) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    const client = await getClient();

    try {
        const response = await (client as any).call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "CRM Lead",
                    lead_name: data.lead_name,
                    organization: data.organization,
                    email_id: data.email_id,
                    mobile_no: data.mobile_no,
                    id_number: data.id_number,
                    first_name: data.lead_name // Defaulting first_name to lead_name if empty
                }
            },
            headers: { 'X-AI-Action': 'true' }
        });
        revalidatePath("/handson/all/crm/leads");
        return { success: true, message: "Lead created successfully via AI", data: response.message };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error creating lead" };
    }
}

export async function updateAiLead(data: { name: string; kyc_status?: "Pending" | "Verified" | "Rejected"; id_number?: string; modelId?: string }) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    const client = await getClient();

    try {
        const response = await (client as any).call({
            method: "frappe.client.set_value",
            args: {
                doctype: "CRM Lead",
                name: data.name,
                fieldname: {
                    kyc_status: data.kyc_status,
                    id_number: data.id_number
                }
            },
            headers: { 'X-AI-Action': 'true' }
        });
        revalidatePath("/handson/all/crm/leads");
        return { success: true, message: "Lead updated successfully via AI", data: response.message };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error updating lead" };
    }
}

// --- CUSTOMERS ---

export async function getCustomers(data: { query?: string; modelId?: string } = {}) {
    const session = await auth();
    const client = await getClient();

    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };

    try {
        const filters: any = {};
        if (data.query) {
            filters.customer_name = ["like", `%${data.query}%`];
        }

        const customers = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Customer",
                filters: filters,
                fields: ["name", "customer_name", "customer_type", "territory"],
                limit_page_length: 10
            },
            headers: { 'X-AI-Action': 'true' }
        });

        return { success: true, customers: (customers as any)?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to fetch customers" };
    }
}

// --- COMMUNICATIONS ---

export async function getCommunicationLogs(data: { query?: string, modelId?: string } = {}) {
    // Communications are tricky re: permissions. Usually linked to docs.
    // For now we restrict to CRM role as it's mostly for sales trails.
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };

    const client = await getClient();
    try {
        const logs = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Communication",
                filters: { communication_medium: "Email" }, // Filter email only?
                fields: ["subject", "sender", "recipients", "communication_date"],
                order_by: "communication_date desc",
                limit_page_length: 10
            },
            headers: { 'X-AI-Action': 'true' }
        });
        return { success: true, logs: (logs as any)?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}
