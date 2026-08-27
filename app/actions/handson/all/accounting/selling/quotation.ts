/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

import { SellingService } from "@/app/services/all/accounting/selling";
import { revalidatePath } from "next/cache";
import { applyGlobalWorkflows } from "@/app/actions/handson/control/workflows/workflows";
import { verifyCrmRole } from "@/app/lib/roles";

export interface QuotationData {
  customer: string;
  transaction_date: string;
  items: { item_code: string; qty: number; rate: number }[];
  order_type?: "Sales";
  docstatus?: 0 | 1;
}

export async function getQuotations() {
  if (!(await verifyCrmRole())) return [];
  try {
    const res = await SellingService.getQuotations();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function getActiveQuotations() {
  if (!(await verifyCrmRole())) return [];
  try {
    // Assuming active means not cancelled/submitted or specific status.
    // For now fetching all or filtering if service supports it.
    const res = await SellingService.getQuotations();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function getQuotation(name: string) {
  if (!(await verifyCrmRole())) return null;
  try {
    const res = await SellingService.getQuotation(name);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function createQuotation(data: QuotationData) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    const finalData = await applyGlobalWorkflows("Quotation", data);
    const res = await SellingService.createQuotation({
      ...finalData,
      order_type: finalData.order_type || "Sales",
    });
    revalidatePath("/handson/all/accounting/selling/quotation");
    return { success: true, message: res };
  } catch (e: any) {
    console.error("Failed to create Quotation", e);
    const msg = e.message?.includes("[Workflow Block]")
      ? e.message.replace("Error: ", "")
      : e?.message || "Unknown error";
    return { success: false, error: msg };
  }
}

export async function updateQuotation(
  name: string,
  data: Partial<QuotationData>,
) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    const res = await SellingService.updateQuotation(name, data);
    revalidatePath("/handson/all/accounting/selling/quotation");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function deleteQuotation(name: string) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    await SellingService.deleteQuotation(name);
    revalidatePath("/handson/all/accounting/selling/quotation");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
