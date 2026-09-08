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
import { PaymentService } from "@/app/services/all/accounting/payments";

export async function cancelPayment(name: string) {
  try {
    await PaymentService.cancel(name);
    revalidatePath("/handson/all/accounting");
    return { success: true };
  } catch (e: any) {
    console.error(`Failed to cancel Payment ${name}`, e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}
