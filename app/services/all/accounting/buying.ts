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

export class BuyingService {
  // --- PURCHASE ORDER ---
  static async getPurchaseOrders() {
    return BaseService.getList("Purchase Order", {
      fields: [
        "name",
        "supplier_name",
        "grand_total",
        "status",
        "transaction_date",
      ],
      limit_page_length: 50,
    });
  }

  static async getPurchaseOrder(name: string) {
    return BaseService.get("Purchase Order", name);
  }

  static async createPurchaseOrder(data: any) {
    return BaseService.insert({ doctype: "Purchase Order", ...data });
  }

  static async updatePurchaseOrder(name: string, data: any) {
    return BaseService.setValue("Purchase Order", name, data);
  }

  static async deletePurchaseOrder(name: string) {
    return BaseService.delete("Purchase Order", name);
  }

  // --- PURCHASE RECEIPT ---
  static async getPurchaseReceipts() {
    return BaseService.getList("Purchase Receipt", {
      fields: ["name", "supplier", "grand_total", "status", "posting_date"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createPurchaseReceipt(data: any) {
    return BaseService.insert({ doctype: "Purchase Receipt", ...data });
  }

  // --- REQUEST FOR QUOTATION ---
  static async getRFQs() {
    return BaseService.getList("Request for Quotation", {
      fields: ["name", "transaction_date", "status"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createRFQ(data: any) {
    return BaseService.insert({ doctype: "Request for Quotation", ...data });
  }

  // --- SUPPLIER QUOTATION ---
  static async getSupplierQuotations() {
    return BaseService.getList("Supplier Quotation", {
      fields: ["name", "supplier", "transaction_date", "status"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createSupplierQuotation(data: any) {
    return BaseService.insert({ doctype: "Supplier Quotation", ...data });
  }

  // --- SUPPLIER ---
  static async getSuppliers() {
    return BaseService.getList("Supplier", {
      fields: ["name", "supplier_name", "supplier_type", "country"],
      limit_page_length: 50,
    });
  }

  static async createSupplier(data: any) {
    return BaseService.insert({ doctype: "Supplier", ...data });
  }

  static async getSupplierScorecards() {
    return BaseService.getList("Supplier Scorecard", {
      fields: ["name", "supplier", "period", "score"],
      limit_page_length: 50,
    });
  }

  // --- QUALITY INSPECTION ---
  static async getQualityInspections() {
    return BaseService.getList("Quality Inspection", {
      fields: [
        "name",
        "inspection_type",
        "reference_type",
        "reference_name",
        "status",
      ],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createQualityInspection(data: any) {
    return BaseService.insert({ doctype: "Quality Inspection", ...data });
  }

  // --- SUBCONTRACTING ---
  static async getSubcontractingOrders() {
    return BaseService.getList("Subcontracting Order", {
      fields: ["name", "supplier", "grand_total", "status", "transaction_date"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createSubcontractingOrder(data: any) {
    return BaseService.insert({ doctype: "Subcontracting Order", ...data });
  }

  static async getSubcontractingReceipts() {
    return BaseService.getList("Subcontracting Receipt", {
      fields: ["name", "supplier", "grand_total", "status", "posting_date"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createSubcontractingReceipt(data: any) {
    return BaseService.insert({ doctype: "Subcontracting Receipt", ...data });
  }

  // --- BLANKET ORDER ---
  static async getBlanketOrders() {
    return BaseService.getList("Blanket Order", {
      fields: ["name", "supplier", "to_date", "status"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createBlanketOrder(data: any) {
    return BaseService.insert({ doctype: "Blanket Order", ...data });
  }
}
