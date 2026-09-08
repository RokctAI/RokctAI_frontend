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
