"use server";

import { getClient } from "@/app/lib/client";
import { verifyCrmRole, verifySupplyChainRole } from "@/app/lib/roles";
import {
    getQuotation, createSalesOrder, updateQuotation,
    getSalesOrder, createDeliveryNote,
    getPurchaseOrder, createPurchaseReceipt
} from "@/app/actions/handson/all/accounting/selling/quotation";



interface SmartActionInput {
    query: string;
    status: "Approved" | "Rejected" | "Delivered" | "Paid" | "Cancelled" | "Completed";
    document_type?: "Quotation" | "Sales Order" | "Purchase Order" | "Invoice" | "Project" | "Task";
}

export async function updateSmartStatus({ query, status, document_type }: SmartActionInput) {
    const client = await getClient();

    // 1. Context & Permission Check
    // We assume CRM/Sales context mostly. 
    // If Buying (Purchase Order), we need Supply Chain role.
    const isCrm = await verifyCrmRole();
    const isSupply = await verifySupplyChainRole();

    // 2. Identify Document
    // If document_type is not provided, we try to guess or search across multiple.
    let doc = null;
    let type = document_type;

    if (!type) {
        // Fuzzy Search Strategy:
        // Try Quotation (CRM)
        if (isCrm) {
            const quotes = await fuzzySearch("Quotation", query);
            if (quotes.length > 0) {
                doc = quotes[0]; // Pick best match
                type = "Quotation";
            }
        }
        // Try Sales Order
        if (!doc && isCrm) {
            const orders = await fuzzySearch("Sales Order", query);
            if (orders.length > 0) {
                doc = orders[0];
                type = "Sales Order";
            }
        }
        // Try Project (Generic)
        if (!doc) {
            const projects = await fuzzySearch("Project", query);
            if (projects.length > 0) {
                doc = projects[0];
                type = "Project";
            }
        }
    } else {
        const results = await fuzzySearch(type, query);
        if (results.length > 0) doc = results[0];
    }

    if (!doc) {
        return { success: false, message: `Could not find any matching document for "${query}".` };
    }

    // 3. Execute Action based on Status
    try {
        if (type === "Quotation") {
            if (status === "Approved") {
                // Convert to Sales Order
                return await convertQuoteToOrder(doc.name);
            } else if (status === "Rejected" || status === "Cancelled") {
                return await updateDocStatus("Quotation", doc.name, "Lost");
            }
        }
        else if (type === "Sales Order") {
            if (status === "Delivered") {
                // Create Delivery Note
                return await convertOrderToDelivery(doc.name);
            } else if (status === "Cancelled") {
                return await updateDocStatus("Sales Order", doc.name, "Cancelled");
            }
        }
        else if (type === "Project" || type === "Task") {
            // Simple Status Update
            // Check valid statuses
            if (status === "Completed" || status === "Cancelled") {
                return await updateDocStatus(type, doc.name, status);
            }
        }

        return { success: false, message: `Action "${status}" not supported for ${type} "${doc.name}" yet.` };

    } catch (e: any) {
        return { success: false, error: e?.message || "Workflow Error" };
    }
}

// --- Helper Functions ---

async function fuzzySearch(doctype: string, query: string) {
    const client = await getClient();
    // Search by Name OR Customer Name
    // Using 'or_filters' if strictly needed, or just multiple calls. 
    // Simple approach: filter by name like query
    const results = await (client as any).call({
        method: "frappe.client.get_list",
        args: {
            doctype,
            filters: [
                ["name", "like", `%${query}%`]
            ],
            fields: ["name", "customer_name", "status", "grand_total"],
            limit_page_length: 5
        }
    });

    // If no results by ID, search by customer/party name?
    // This is optional but powerful.
    if (!results?.message?.length) {
        const customerResults = await (client as any).call({
            method: "frappe.client.get_list",
            args: {
                doctype,
                filters: [
                    ["customer_name", "like", `%${query}%`]
                ],
                fields: ["name", "customer_name", "status"],
                limit_page_length: 5,
                order_by: "creation desc" // prioritize recent
            }
        });
        return customerResults?.message || [];
    }

    return results?.message || [];
}

async function updateDocStatus(doctype: string, name: string, status: string) {
    const client = await getClient();
    await (client as any).call({
        method: "frappe.client.set_value",
        args: { doctype, name, fieldname: { status } }
    });

    // NOTIFY
    const { notifyDecision } = await import("@/app/actions/ai/notifications");
    await notifyDecision(doctype, name, status as any);

    return { success: true, message: `${doctype} ${name} marked as ${status}.` };
}

async function convertQuoteToOrder(quoteName: string) {
    // 1. Fetch Quote
    // We need to fetch from commercial.ts or raw client
    // We'll use raw client to avoid circular deps if any, or just import
    const { getQuotation } = await import("@/app/actions/handson/all/accounting/selling/quotation");
    const { createSalesOrder } = await import("@/app/actions/handson/all/accounting/selling/sales_order");

    const quote = await getQuotation(quoteName);
    if (!quote) return { success: false, message: "Quote not found." };

    // 2. Map Data
    const orderData = {
        customer: quote.customer,
        transaction_date: new Date().toISOString().split('T')[0],
        items: quote.items.map((i: any) => ({
            item_code: i.item_code,
            qty: i.qty,
            rate: i.rate
        })),
        company: quote.company || "Juvo" // Default or fetch
    };

    // 3. Create Order
    const result = await createSalesOrder(orderData);

    // 4. Update Quote Status to Ordered (if success)
    if (result.success) {
        await updateDocStatus("Quotation", quoteName, "Ordered");

        // NOTIFY about the new Order too?
        const { notifyDecision } = await import("@/app/actions/ai/notifications");
        // "Sales Order" Created
        // We notify about the Quote being Ordered (handled by updateDocStatus above)
        // Maybe notify about Sales Order creation?
        if (result.name) {
            // result.name might be the ID if createSalesOrder returns it.
            // createSalesOrder returns { success, message: ID } usually.
            const orderId = result.message;
            await notifyDecision("Sales Order", orderId, "Created" as any);
        }

        return { success: true, message: `Sales Order created from Quote ${quoteName}.` };
    }
    return result;
}

async function convertOrderToDelivery(orderName: string) {
    const { getSalesOrder } = await import("@/app/actions/handson/all/accounting/selling/sales_order");
    const { createDeliveryNote } = await import("@/app/actions/handson/all/accounting/selling/delivery_note");

    const order = await getSalesOrder(orderName);
    if (!order) return { success: false, message: "Order not found." };

    const dnData = {
        customer: order.customer,
        company: order.company,
        posting_date: new Date().toISOString().split('T')[0],
        items: order.items.map((i: any) => ({
            item_code: i.item_code,
            qty: i.qty
        }))
    };

    const result = await createDeliveryNote(dnData);
    if (result.success) {
        await updateDocStatus("Sales Order", orderName, "Completed"); // Or Delivered

        // NOTIFY
        const { notifyDecision } = await import("@/app/actions/ai/notifications");
        if (result.message) {
            await notifyDecision("Delivery Note", result.message, "Created" as any);
        }

        return { success: true, message: `Goods Delivered against Order ${orderName}.` };
    }
    return result;
}
