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

export async function getRoutings() {
  try {
    const res = await ManufacturingService.getRoutings();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createRouting(data: {
  routing_name: string;
  operations: {
    operation: string;
    workstation: string;
    time_in_mins: number;
  }[];
}) {
  try {
    const res = await ManufacturingService.createRouting(data);
    // Assuming there is a routing page or it lives in shop floor?
    // supply_chain.ts didn't have specific revalidate for routing other than generally maybe?
    // Let's assume manufacturing root for now or shop floor
    revalidatePath("/handson/all/accounting/manufacturing");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
