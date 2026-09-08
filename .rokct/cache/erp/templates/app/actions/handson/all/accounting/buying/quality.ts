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

import { BuyingService } from "@/app/services/all/accounting/buying";
import { revalidatePath } from "next/cache";

export async function getQualityInspections() {
  try {
    const res = await BuyingService.getQualityInspections();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createQualityInspection(data: {
  inspection_type: string;
  reference_type: string;
  reference_name: string;
  status: string;
}) {
  try {
    const res = await BuyingService.createQualityInspection(data);
    revalidatePath("/handson/all/accounting/buying/quality");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
