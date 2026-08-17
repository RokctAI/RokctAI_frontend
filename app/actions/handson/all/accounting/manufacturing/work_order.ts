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

import { ManufacturingService } from "@/app/services/all/accounting/manufacturing";
import { revalidatePath } from "next/cache";

export async function getWorkOrders() {
  try {
    const res = await ManufacturingService.getWorkOrders();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function getWorkOrder(id: string) {
  try {
    const res = await ManufacturingService.getWorkOrder(id);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function createWorkOrder(data: {
  production_item: string;
  qty: number;
  company: string;
  plan_start_date: string;
}) {
  try {
    const res = await ManufacturingService.createWorkOrder(data);
    revalidatePath("/handson/all/accounting/manufacturing/work-order");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
