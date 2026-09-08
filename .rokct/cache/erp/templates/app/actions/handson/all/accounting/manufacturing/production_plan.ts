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

export interface ProductionPlanData {
  company: string;
  posting_date: string;
  po_items: {
    item_code: string;
    planned_qty: number;
  }[];
}

export async function getProductionPlans() {
  try {
    const res = await ManufacturingService.getProductionPlans();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createProductionPlan(data: ProductionPlanData) {
  try {
    const res = await ManufacturingService.createProductionPlan(data);
    revalidatePath("/handson/all/accounting/manufacturing/production-plan");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
