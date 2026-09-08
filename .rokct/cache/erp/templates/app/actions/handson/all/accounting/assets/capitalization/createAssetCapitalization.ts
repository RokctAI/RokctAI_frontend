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

import { revalidatePath } from "next/cache";
import { AssetCapitalizationService } from "@/app/services/all/accounting/assets";

export async function createAssetCapitalization(data: {
  entry_type: string;
  target_asset?: string;
  posting_date: string;
  stock_items: { item_code: string; qty: number }[];
}) {
  try {
    const response = await AssetCapitalizationService.create(data);
    revalidatePath("/handson/all/accounting");
    return { success: true, message: response?.message };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
