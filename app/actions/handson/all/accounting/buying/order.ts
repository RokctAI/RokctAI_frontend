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

import { BuyingService } from "@/app/services/all/accounting/buying";
import { revalidatePath } from "next/cache";

export interface PurchaseOrderData {
  supplier: string;
  transaction_date: string;
  items: { item_code: string; qty: number; rate: number }[];
  docstatus?: 0 | 1;
}

export async function getPurchaseOrders() {
  try {
    const res = await BuyingService.getPurchaseOrders();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function getPurchaseOrder(name: string) {
  try {
    const res = await BuyingService.getPurchaseOrder(name);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function createPurchaseOrder(data: PurchaseOrderData) {
  try {
    const res = await BuyingService.createPurchaseOrder(data);
    revalidatePath("/handson/all/accounting/buying/order");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function updatePurchaseOrder(
  name: string,
  data: Partial<PurchaseOrderData>,
) {
  try {
    const res = await BuyingService.updatePurchaseOrder(name, data);
    revalidatePath("/handson/all/accounting/buying/order");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function deletePurchaseOrder(name: string) {
  try {
    await BuyingService.deletePurchaseOrder(name);
    revalidatePath("/handson/all/accounting/buying/order");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

// Blanket Order
export async function getBlanketOrders() {
  try {
    const res = await BuyingService.getBlanketOrders();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createBlanketOrder(data: {
  supplier: string;
  to_date: string;
  items: { item_code: string; qty: number; rate: number }[];
}) {
  try {
    const res = await BuyingService.createBlanketOrder(data);
    revalidatePath("/handson/all/accounting/buying/order"); // Consolidate under 'order' page usually or blanket-order if exists
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
