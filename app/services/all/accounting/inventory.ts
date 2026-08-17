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

import { BaseService } from "@/app/services/common/base";

export class InventoryService {
  // --- ITEM ---
  static async getItems() {
    return BaseService.getList("Item", {
      fields: [
        "item_code",
        "item_name",
        "item_group",
        "stock_uom",
        "standard_rate",
      ],
      limit_page_length: 100,
      order_by: "creation desc",
    });
  }

  static async getItem(item_code: string) {
    return BaseService.get("Item", item_code);
  }

  static async createItem(data: any) {
    return BaseService.insert({ doctype: "Item", ...data });
  }

  static async updateItem(item_code: string, data: any) {
    return BaseService.setValue("Item", item_code, data);
  }

  static async deleteItem(item_code: string) {
    return BaseService.delete("Item", item_code);
  }

  // --- STOCK RECONCILIATION ---
  static async getStockReconciliations() {
    return BaseService.getList("Stock Reconciliation", {
      fields: ["name", "company", "posting_date", "purpose"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createStockReconciliation(data: any) {
    return BaseService.insert({ doctype: "Stock Reconciliation", ...data });
  }

  // --- LEDGER ---
  static async getStockLedgerEntries() {
    return BaseService.getList("Stock Ledger Entry", {
      fields: [
        "name",
        "item_code",
        "warehouse",
        "qty_change",
        "valuation_rate",
        "posting_date",
      ],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  // --- LANDED COST ---
  static async getLandedCostVouchers() {
    return BaseService.getList("Landed Cost Voucher", {
      fields: ["name", "company", "posting_date"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createLandedCostVoucher(data: any) {
    return BaseService.insert({ doctype: "Landed Cost Voucher", ...data });
  }

  // --- BATCH & SERIAL ---
  static async getBatches() {
    return BaseService.getList("Batch", {
      fields: ["name", "item", "expiry_date"],
      limit_page_length: 50,
    });
  }

  static async getSerialNos() {
    return BaseService.getList("Serial No", {
      fields: ["name", "item_code", "status", "warehouse"],
      limit_page_length: 50,
    });
  }

  // --- MATERIAL REQUEST ---
  static async getMaterialRequests() {
    return BaseService.getList("Material Request", {
      fields: ["name", "transaction_date", "status", "material_request_type"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createMaterialRequest(data: any) {
    return BaseService.insert({ doctype: "Material Request", ...data });
  }

  // --- PICK LIST ---
  static async getPickLists() {
    return BaseService.getList("Pick List", {
      fields: ["name", "purpose", "status"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createPickList(data: any) {
    return BaseService.insert({ doctype: "Pick List", ...data });
  }

  // --- SHIPMENT ---
  static async getShipments() {
    return BaseService.getList("Shipment", {
      fields: ["name", "delivery_note", "carrier", "tracking_number", "status"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createShipment(data: any) {
    return BaseService.insert({ doctype: "Shipment", ...data });
  }

  // --- STOCK ENTRY ---
  static async getStockEntries() {
    return BaseService.getList("Stock Entry", {
      fields: ["name", "stock_entry_type", "posting_date", "purpose"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createStockEntry(data: any) {
    return BaseService.insert({ doctype: "Stock Entry", ...data });
  }

  // --- WAREHOUSE ---
  static async getWarehouses() {
    return BaseService.getList("Warehouse", {
      fields: ["name", "warehouse_name", "company"],
      limit_page_length: 100,
      order_by: "name asc",
    });
  }
}
