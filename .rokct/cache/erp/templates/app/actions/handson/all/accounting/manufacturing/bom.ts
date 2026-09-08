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

import { ManufacturingService } from "@/app/services/all/accounting/manufacturing";
import { revalidatePath } from "next/cache";

export async function getBOMs() {
  try {
    const res = await ManufacturingService.getBOMs();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function getBOM(name: string) {
  try {
    const res = await ManufacturingService.getBOM(name);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function createBOM(
  item: string,
  quantity: number,
  items: { item_code: string; qty: number }[],
) {
  try {
    const res = await ManufacturingService.createBOM(item, quantity, items);
    revalidatePath("/handson/all/accounting/manufacturing/bom");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function deleteBOM(name: string) {
  try {
    await ManufacturingService.deleteBOM(name);
    revalidatePath("/handson/all/accounting/manufacturing/bom");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
