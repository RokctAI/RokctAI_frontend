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
