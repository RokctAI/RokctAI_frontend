"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function getReceipts() {
  try {
    const receipts = await paasCall("api.receipt.get_receipts", {
        limit_start: 0,
        limit_page_length: 100,
      });
    return receipts;
  } catch (error) {
    console.error("Failed to fetch receipts:", error);
    return [];
  }
}

export async function getReceiptDetails(id: string) {
  try {
    const receipt = await paasCall("api.receipt.get_receipt", {
        id: id,
      });
    return receipt;
  } catch (error) {
    console.error("Failed to fetch receipt details:", error);
    throw error;
  }
}
