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

import { SellingService } from "@/app/services/all/accounting/selling";
import { revalidatePath } from "next/cache";
import { verifyCrmRole } from "@/app/lib/roles";

export async function getSalesPartners() {
  if (!(await verifyCrmRole())) return [];
  try {
    const res = await SellingService.getSalesPartners();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createSalesPartner(data: {
  partner_name: string;
  commission_rate: number;
  partner_type?: string;
}) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    const res = await SellingService.createSalesPartner(data);
    revalidatePath("/handson/all/accounting/selling/sales-partner");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function getProductBundles() {
  if (!(await verifyCrmRole())) return [];
  try {
    const res = await SellingService.getProductBundles();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createProductBundle(data: {
  new_item_code: string;
  items: { item_code: string; qty: number }[];
}) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    const res = await SellingService.createProductBundle(data);
    revalidatePath("/handson/all/accounting/selling/product-bundle");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function getShippingRules() {
  if (!(await verifyCrmRole())) return [];
  try {
    const res = await SellingService.getShippingRules();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createShippingRule(data: {
  label: string;
  calculate_based_on: string;
  shipping_amount?: number;
}) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    const res = await SellingService.createShippingRule(data);
    revalidatePath("/handson/all/accounting/selling/shipping-rule");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
