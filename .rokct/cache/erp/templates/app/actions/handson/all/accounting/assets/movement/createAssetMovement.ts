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
import { AssetMovementService } from "@/app/services/all/accounting/assets";

export async function createAssetMovement(data: {
  transaction_date: string;
  purpose: string;
  assets: { asset: string; target_location?: string }[];
}) {
  try {
    const response = await AssetMovementService.create(data);
    revalidatePath("/handson/all/accounting");
    return { success: true, message: response?.message };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
