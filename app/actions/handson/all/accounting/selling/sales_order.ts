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

export async function getSalesOrders() {
  if (!(await verifyCrmRole())) return [];
  try {
    const res = await SellingService.getSalesOrders();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function getSalesOrder(name: string) {
  if (!(await verifyCrmRole())) return null;
  try {
    const res = await SellingService.getSalesOrder(name);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function createSalesOrder(data: any) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    const res = await SellingService.createSalesOrder(data);
    revalidatePath("/handson/all/accounting/selling/sales-order");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

// Customers are often needed for Sales Order creation
export async function getCustomers() {
  if (!(await verifyCrmRole())) return [];
  try {
    const res = await SellingService.getCustomers();
    return res.data;
  } catch (e) {
    return [];
  }
}
