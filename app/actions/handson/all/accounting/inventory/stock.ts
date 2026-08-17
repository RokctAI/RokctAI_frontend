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

import { InventoryService } from "@/app/services/all/accounting/inventory";
import { revalidatePath } from "next/cache";

// Reconciliation
export async function getStockReconciliations() {
  try {
    const res = await InventoryService.getStockReconciliations();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createStockReconciliation(data: {
  company: string;
  posting_date: string;
  items: {
    item_code: string;
    qty: number;
    warehouse: string;
    valuation_rate: number;
  }[];
}) {
  try {
    const res = await InventoryService.createStockReconciliation(data);
    revalidatePath("/handson/all/accounting/inventory/reconciliation");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

// Ledger
export async function getStockLedgerEntries() {
  try {
    const res = await InventoryService.getStockLedgerEntries();
    return res.data;
  } catch (e) {
    return [];
  }
}

// Landed Cost
export async function getLandedCostVouchers() {
  try {
    const res = await InventoryService.getLandedCostVouchers();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createLandedCostVoucher(data: {
  company: string;
  receipt_document_type: string;
  receipt_document: string;
  taxes: { account: string; amount: number }[];
}) {
  try {
    const res = await InventoryService.createLandedCostVoucher(data);
    revalidatePath("/handson/all/accounting/inventory");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

// Stock Entry (Missing)
export async function createStockEntry(data: any) {
  try {
    const res = await InventoryService.createStockEntry(data);
    revalidatePath("/handson/all/accounting/inventory");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function getWarehouses() {
  try {
    const res = await InventoryService.getWarehouses();
    return res.data;
  } catch (e) {
    return [];
  }
}
