"use server";

import { getClient } from "@/app/lib/client";
import { auth } from "@/app/(auth)/auth";
import { verifyFinanceRole } from "@/app/lib/roles";

// --- INVOICES (SALES) ---

export async function getSalesInvoices(data: { modelId?: string } = {}) {
    if (!await verifyFinanceRole()) return { success: false, error: "Unauthorized" };

    const client = await getClient();

    try {
        const invoices = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Sales Invoice",
                filters: {
                    status: ["not in", ["Paid", "Cancelled", "Draft"]], // Fetch Unpaid/Overdue
                    docstatus: 1
                },
                fields: ["name", "customer_name", "grand_total", "outstanding_amount", "due_date", "status"],
                order_by: "due_date asc",
                limit_page_length: 10
            }
        });

        return { success: true, invoices: invoices?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to fetch invoices" };
    }
}

// --- BILLS (PURCHASE) ---

export async function getPurchaseInvoices(data: { modelId?: string } = {}) {
    if (!await verifyFinanceRole()) return { success: false, error: "Unauthorized" };

    const client = await getClient();

    try {
        const invoices = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Purchase Invoice",
                filters: {
                    status: ["not in", ["Paid", "Cancelled", "Draft"]],
                    docstatus: 1
                },
                fields: ["name", "supplier_name", "grand_total", "outstanding_amount", "bill_date", "status"],
                order_by: "bill_date asc",
                limit_page_length: 10
            }
        });

        return { success: true, invoices: invoices?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to fetch purchase invoices" };
    }
}

// --- PAYMENTS ---

export async function getPendingPayments(data: { modelId?: string } = {}) {
    if (!await verifyFinanceRole()) return { success: false, error: "Unauthorized" };

    const client = await getClient();

    try {
        // Fetch Payment Entries in Draft or Posted but unallocated?
        // Usually "Draft" payments imply pending approval/submission
        const payments = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Payment Entry",
                filters: {
                    docstatus: 0 // Draft
                },
                fields: ["name", "party_name", "paid_amount", "payment_type", "posting_date"],
                order_by: "posting_date desc",
                limit_page_length: 5
            }
        });

        return { success: true, payments: payments?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to fetch payments" };
    }
}
