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
