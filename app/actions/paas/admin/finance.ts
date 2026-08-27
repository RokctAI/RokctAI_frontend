/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getSalesReport(
  fromDate: string,
  toDate: string,
  company?: string,
) {
  try {
    return await paasCall("api.admin_reports.get_multi_company_sales_report", {
      from_date: fromDate,
      to_date: toDate,
      company,
    });
  } catch (error) {
    console.error("Failed to fetch sales report:", error);
    return [];
  }
}

export async function getTransactions(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_reports.get_all_transactions", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

export async function getPayouts(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_reports.get_all_seller_payouts", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch payouts:", error);
    return [];
  }
}

export async function getWalletHistory(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_reports.get_all_wallet_histories", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch wallet history:", error);
    return [];
  }
}

export async function getPaymentPayloads(page: number = 1, limit: number = 20) {
  const frappe = await getPaaSClient();
  const start = (page - 1) * limit;
  try {
    return await frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Payment Payload",
        fields: ["name", "payload", "creation"],
        order_by: "creation desc",
        limit_start: start,
        limit_page_length: limit,
      },
    });
  } catch (error) {
    console.error("Failed to fetch payment payloads:", error);
    return [];
  }
}
