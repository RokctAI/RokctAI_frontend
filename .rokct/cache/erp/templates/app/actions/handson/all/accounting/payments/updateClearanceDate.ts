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

import { PaymentService } from "@/app/services/all/accounting/payments";
import { JournalService } from "@/app/services/all/accounting/journals";
import { revalidatePath } from "next/cache";

export async function updateClearanceDate(
  doctype: "Payment Entry" | "Journal Entry",
  name: string,
  date: string,
) {
  try {
    let response;
    if (doctype === "Payment Entry") {
      response = await PaymentService.setClearanceDate(name, date);
    } else {
      response = await JournalService.setClearanceDate(name, date);
    }
    revalidatePath("/handson/all/accounting");
    return { success: true, message: response?.message };
  } catch (e: any) {
    console.error(`Failed to update clearance date for ${name}`, e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}
