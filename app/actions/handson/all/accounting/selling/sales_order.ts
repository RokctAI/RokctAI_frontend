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

import { SellingService } from "@/app/services/all/accounting/selling";
import { revalidatePath } from "next/cache";
import { verifyCrmRole } from "@/app/lib/roles";

export async function getSalesOrders() {
  if (!(await verifyCrmRole())) return [];
  try {
    const res = await SellingService.getSalesOrders();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function getSalesOrder(name: string) {
  if (!(await verifyCrmRole())) return null;
  try {
    const res = await SellingService.getSalesOrder(name);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function createSalesOrder(data: any) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    const res = await SellingService.createSalesOrder(data);
    revalidatePath("/handson/all/accounting/selling/sales-order");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

// Customers are often needed for Sales Order creation
export async function getCustomers() {
  if (!(await verifyCrmRole())) return [];
  try {
    const res = await SellingService.getCustomers();
    return res.data;
  } catch (e) {
    return [];
  }
}
