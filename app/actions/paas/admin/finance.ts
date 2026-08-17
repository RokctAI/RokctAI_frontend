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
    return await paasCall("api.admin_reports.get_multi_company_sales_report", { from_date: fromDate, to_date: toDate, company });
  } catch (error) {
    console.error("Failed to fetch sales report:", error);
    return [];
  }
}

export async function getTransactions(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_reports.get_all_transactions", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

export async function getPayouts(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_reports.get_all_seller_payouts", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch payouts:", error);
    return [];
  }
}

export async function getWalletHistory(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_reports.get_all_wallet_histories", { limit_start: start, limit_page_length: limit });
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
