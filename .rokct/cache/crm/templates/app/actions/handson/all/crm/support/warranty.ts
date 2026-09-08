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
import { verifyCrmRole } from "@/app/lib/roles";
import { SupportService } from "@/app/services/all/crm/support";

export async function getWarrantyClaims() {
  if (!(await verifyCrmRole())) return [];
  try {
    return await SupportService.getWarrantyClaims();
  } catch (e) {
    return [];
  }
}

export async function createWarrantyClaim(data: {
  customer: string;
  item_code: string;
  issue_date: string;
  description: string;
}) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    const result = await SupportService.createWarrantyClaim(data);
    revalidatePath("/handson/all/crm/support/warranty");
    return { success: true, message: result };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
