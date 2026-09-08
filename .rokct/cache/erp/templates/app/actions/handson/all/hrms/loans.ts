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
import { LoanService } from "@/app/services/all/hrms/loans";

export async function createLoan(data: any) {
  try {
    const result = await LoanService.create(data);
    revalidatePath("/handson/all/hrms/loan");
    return { success: true, message: result };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

export async function getLoans() {
  try {
    const result = await LoanService.getList();
    return { success: true, message: result };
  } catch (e) {
    return { success: false, error: "Failed to fetch loans" };
  }
}
