"use server";

import { getClient } from "@/app/lib/client";
import { auth } from "@/app/(auth)/auth";
import { verifySystemManager } from "@/app/lib/roles";

// Tenant Action Actions

export async function getBillingStatus(data: { modelId?: string } = {}) {
    // In a multi-tenant setup, this often checks a specific Subscription doctype
    if (!await verifySystemManager()) return { success: false, error: "Unauthorized" };

    const client = await getClient();
    try {
        // Assuming "Subscription" doctype (or generic placeholder)
        const sub = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Subscription", // Standard in ERPNext
                fields: ["name", "status", "next_payment_date", "plan"],
                limit_page_length: 1
            }
        });
        return { success: true, subscription: sub?.message?.[0] || "No active subscription found." };
    } catch (e: any) {
        return { success: false, error: "Failed to fetch billing status." };
    }
}

export async function contactSupport(data: { subject: string, message: string, modelId?: string }) {
    if (!await verifySystemManager()) return { success: false, error: "Unauthorized" };

    const client = await getClient();
    try {
        // Create an Issue or Support Ticket
        const response = await client.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Issue",
                    subject: data.subject,
                    description: data.message,
                    raised_by: (await auth())?.user?.email
                }
            }
        });
        return { success: true, message: "Support ticket created." };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to contact support." };
    }
}
