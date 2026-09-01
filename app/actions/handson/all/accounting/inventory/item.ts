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
