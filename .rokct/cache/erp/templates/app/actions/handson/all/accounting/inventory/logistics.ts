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
