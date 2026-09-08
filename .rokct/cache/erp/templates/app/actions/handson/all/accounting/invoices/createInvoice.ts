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
// import { applyGlobalWorkflows } from "@/app/actions/handson/control/workflows";
import { InvoiceService } from "@/app/services/all/accounting/invoices";
import { InvoiceData } from "./types";

export async function createInvoice(data: InvoiceData) {
  try {
    // 1. Apply Global Workflow Rules (Blocks or Modifies)
    // const finalData = await applyGlobalWorkflows("Sales Invoice", data);
    const finalData = data; // Bypass workflow for now as function is missing

    const response = await InvoiceService.create(finalData);
    revalidatePath("/handson/all/accounting");
    return { success: true, message: response?.message };
  } catch (e: any) {
    console.error("Failed to create Invoice", e);
    const msg = e.message?.includes("[Workflow Block]")
      ? e.message.replace("Error: ", "")
      : e?.message || "Unknown error";
    return { success: false, error: msg };
  }
}
