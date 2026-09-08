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
import { PurchaseService } from "@/app/services/all/accounting/purchases";
import { PurchaseInvoiceData } from "./types";

export async function createPurchaseInvoice(data: PurchaseInvoiceData) {
  try {
    const response = await PurchaseService.create(data);
    revalidatePath("/handson/all/accounting");
    return { success: true, message: response?.message };
  } catch (e: any) {
    console.error("Failed to create Purchase Invoice", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}
