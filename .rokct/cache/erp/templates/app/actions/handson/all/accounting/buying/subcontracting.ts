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

export interface SubcontractingOrderData {
  supplier: string;
  items: {
    item_code: string;
    qty: number;
    rate: number;
  }[];
}

export interface SubcontractingReceiptData {
  supplier: string;
  items: {
    item_code: string;
    qty: number;
    rate: number;
  }[];
}

export async function getSubcontractingOrders() {
  try {
    const res = await BuyingService.getSubcontractingOrders();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createSubcontractingOrder(data: SubcontractingOrderData) {
  try {
    const res = await BuyingService.createSubcontractingOrder(data);
    revalidatePath("/handson/all/accounting/buying/subcontracting/order");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function getSubcontractingReceipts() {
  try {
    const res = await BuyingService.getSubcontractingReceipts();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createSubcontractingReceipt(
  data: SubcontractingReceiptData,
) {
  try {
    const res = await BuyingService.createSubcontractingReceipt(data);
    revalidatePath("/handson/all/accounting/buying/subcontracting/receipt");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
