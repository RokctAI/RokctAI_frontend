/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use server";

import { getClient } from "@/app/lib/client";
import { auth } from "@/app/(auth)/auth";
import { verifyFinanceRole } from "@/app/lib/roles";
import { gatewayCall } from "@/app/lib/gateway-rpc";

// --- INVOICES (SALES) ---

export async function getSalesInvoices(data: { modelId?: string } = {}) {
  if (!(await verifyFinanceRole()))
    return { success: false, error: "Unauthorized" };

  const client = await getClient();

  try {
    const invoices = await gatewayCall(client, "frappe.client.get_list", {
      doctype: "Sales Invoice",
      filters: {
        status: ["not in", ["Paid", "Cancelled", "Draft"]], // Fetch Unpaid/Overdue
        docstatus: 1,
      },
      fields: [
        "name",
        "customer_name",
        "grand_total",
        "outstanding_amount",
        "due_date",
        "status",
      ],
      order_by: "due_date asc",
      limit_page_length: 10,
    });

    return { success: true, invoices: invoices?.message || [] };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to fetch invoices" };
  }
}

// --- BILLS (PURCHASE) ---

export async function getPurchaseInvoices(data: { modelId?: string } = {}) {
  if (!(await verifyFinanceRole()))
    return { success: false, error: "Unauthorized" };

  const client = await getClient();

  try {
    const invoices = await gatewayCall(client, "frappe.client.get_list", {
      doctype: "Purchase Invoice",
      filters: {
        status: ["not in", ["Paid", "Cancelled", "Draft"]],
        docstatus: 1,
      },
      fields: [
        "name",
        "supplier_name",
        "grand_total",
        "outstanding_amount",
        "bill_date",
        "status",
      ],
      order_by: "bill_date asc",
      limit_page_length: 10,
    });

    return { success: true, invoices: invoices?.message || [] };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Failed to fetch purchase invoices",
    };
  }
}

// --- PAYMENTS ---

export async function getPendingPayments(data: { modelId?: string } = {}) {
  if (!(await verifyFinanceRole()))
    return { success: false, error: "Unauthorized" };

  const client = await getClient();

  try {
    // Fetch Payment Entries in Draft or Posted but unallocated?
    // Usually "Draft" payments imply pending approval/submission
    const payments = await gatewayCall(client, "frappe.client.get_list", {
      doctype: "Payment Entry",
      filters: {
        docstatus: 0, // Draft
      },
      fields: [
        "name",
        "party_name",
        "paid_amount",
        "payment_type",
        "posting_date",
      ],
      order_by: "posting_date desc",
      limit_page_length: 5,
    });

    return { success: true, payments: payments?.message || [] };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to fetch payments" };
  }
}
