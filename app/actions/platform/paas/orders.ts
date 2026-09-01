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

// @ts-nocheck
/**
 * Generated Server Actions for Platform Module: paas, Group: orders
 * Author: ROKCT Code Generator
 */
"use server";

import { OrdersService } from "@/app/services/platform/paas/orders";
import { revalidatePath } from "next/cache";

/**
 * Fetch list of client orders
 */
export async function list(payload?: any) {
  try {
    const result = await OrdersService.list(payload);
    return result;
  } catch (error) {
    console.error("Failed to execute Server Action list:", error);
    throw error;
  }
}
