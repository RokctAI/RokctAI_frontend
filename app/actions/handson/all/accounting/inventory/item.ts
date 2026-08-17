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

export interface ItemData {
  item_code: string;
  item_name: string;
  item_group: string;
  stock_uom: string;
  standard_rate: number;
  opening_stock?: number;
  description?: string;
}

export async function getItems() {
  try {
    const res = await InventoryService.getItems();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function getItem(item_code: string) {
  try {
    const res = await InventoryService.getItem(item_code);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function createItem(data: ItemData) {
  try {
    const res = await InventoryService.createItem(data);
    revalidatePath("/handson/all/accounting/inventory");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function updateItem(item_code: string, data: Partial<ItemData>) {
  try {
    const res = await InventoryService.updateItem(item_code, data);
    revalidatePath("/handson/all/accounting/inventory");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function deleteItem(item_code: string) {
  try {
    await InventoryService.deleteItem(item_code);
    revalidatePath("/handson/all/accounting/inventory");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
