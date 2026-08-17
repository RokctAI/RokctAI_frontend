/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use server";

import { InventoryService } from "@/app/services/all/accounting/inventory";
import { revalidatePath } from "next/cache";

// Material Request
export async function getMaterialRequests() {
  try {
    const res = await InventoryService.getMaterialRequests();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createMaterialRequest(data: {
  transaction_date: string;
  material_request_type: string;
  items: { item_code: string; qty: number; schedule_date: string }[];
}) {
  try {
    const res = await InventoryService.createMaterialRequest(data);
    revalidatePath("/handson/all/accounting/inventory"); // or subpath
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

// Pick List
export async function getPickLists() {
  try {
    const res = await InventoryService.getPickLists();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createPickList(data: {
  purpose: string;
  locations: { item_code: string; qty: number; warehouse: string }[];
}) {
  try {
    const res = await InventoryService.createPickList(data);
    revalidatePath("/handson/all/accounting/inventory");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

// Shipment
export async function getShipments() {
  try {
    const res = await InventoryService.getShipments();
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function createShipment(data: {
  delivery_from_type: string;
  delivery_from: string;
  carrier: string;
  tracking_number?: string;
}) {
  try {
    const res = await InventoryService.createShipment(data);
    revalidatePath("/handson/all/accounting/inventory");
    return { success: true, message: res };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
