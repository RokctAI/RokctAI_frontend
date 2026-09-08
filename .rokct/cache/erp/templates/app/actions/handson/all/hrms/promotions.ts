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
import { verifyHrRole } from "@/app/lib/roles";
import { PromotionService } from "@/app/services/all/hrms/promotions";
import type { PromotionData } from "@/app/services/all/hrms/promotions";

export async function getPromotions() {
  try {
    return await PromotionService.getList();
  } catch (e) {
    console.error("Failed to fetch promotions", e);
    return [];
  }
}

export async function createPromotion(data: PromotionData) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    const result = await PromotionService.create(data);
    revalidatePath("/handson/all/hrms/personnel");
    return { success: true, message: "Promotion created", name: result.name };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to create promotion" };
  }
}
