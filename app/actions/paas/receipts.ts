/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
