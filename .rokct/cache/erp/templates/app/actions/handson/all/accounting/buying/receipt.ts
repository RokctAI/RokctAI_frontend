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

import { BuyingService } from "@/app/services/all/accounting/buying";
import { revalidatePath } from "next/cache";

export interface PurchaseReceiptData {
  supplier: string;
  items: {
    item_code: string;
    qty: number;
    rate?: number;
  }[];
  posting_date?: string;
  company?: string;
}

export async function getPurchaseReceipts() {
  try {
    const res = await BuyingService.getPurchaseReceipts();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createPurchaseReceipt(data: PurchaseReceiptData) {
  try {
    const res = await BuyingService.createPurchaseReceipt(data);
    revalidatePath("/handson/all/accounting/buying/receipt");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
