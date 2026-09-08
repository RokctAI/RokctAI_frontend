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

export interface SupplierData {
  supplier_name: string;
  supplier_group?: string;
  supplier_type: "Company" | "Individual";
  country?: string;
  email_id?: string;
}

export async function getSuppliers() {
  try {
    const res = await BuyingService.getSuppliers();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createSupplier(data: SupplierData) {
  try {
    const res = await BuyingService.createSupplier(data);
    revalidatePath("/handson/all/accounting/buying/supplier");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function getSupplierQuotations() {
  try {
    const res = await BuyingService.getSupplierQuotations();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createSupplierQuotation(data: {
  supplier: string;
  items: { item_code: string; qty: number; rate: number }[];
}) {
  try {
    const res = await BuyingService.createSupplierQuotation(data);
    revalidatePath("/handson/all/accounting/buying/supplier-quotation");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function getSupplierScorecards() {
  try {
    const res = await BuyingService.getSupplierScorecards();
    return res.data;
  } catch (e) {
    return [];
  }
}
