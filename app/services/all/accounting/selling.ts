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

import { BaseService } from "@/app/services/common/base";

export class SellingService {
  // --- QUOTATION ---
  static async getQuotations() {
    return BaseService.getList("Quotation", {
      fields: [
        "name",
        "customer_name",
        "grand_total",
        "status",
        "transaction_date",
      ],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async getQuotation(name: string) {
    return BaseService.get("Quotation", name);
  }

  static async createQuotation(data: any) {
    return BaseService.insert({ doctype: "Quotation", ...data });
  }

  static async updateQuotation(name: string, data: any) {
    return BaseService.setValue("Quotation", name, data);
  }

  static async deleteQuotation(name: string) {
    return BaseService.delete("Quotation", name);
  }

  // --- SALES ORDER ---
  static async getSalesOrders() {
    return BaseService.getList("Sales Order", {
      fields: [
        "name",
        "customer_name",
        "grand_total",
        "status",
        "delivery_date",
      ],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async getSalesOrder(name: string) {
    return BaseService.get("Sales Order", name);
  }

  static async createSalesOrder(data: any) {
    return BaseService.insert({ doctype: "Sales Order", ...data });
  }

  // --- DELIVERY NOTE ---
  static async getDeliveryNotes() {
    return BaseService.getList("Delivery Note", {
      fields: ["name", "customer", "posting_date", "status", "grand_total"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async getDeliveryNote(name: string) {
    return BaseService.get("Delivery Note", name);
  }

  static async createDeliveryNote(data: any) {
    return BaseService.insert({ doctype: "Delivery Note", ...data });
  }

  // --- CUSTOMER ---
  static async getCustomers() {
    return BaseService.getList("Customer", {
      fields: ["name", "customer_name", "customer_type", "territory"],
      limit_page_length: 50,
    });
  }

  // --- EXTRAS ---
  static async getSalesPartners() {
    return BaseService.getList("Sales Partner", {
      fields: ["name", "partner_name", "commission_rate", "partner_type"],
      limit_page_length: 50,
    });
  }

  static async createSalesPartner(data: any) {
    return BaseService.insert({ doctype: "Sales Partner", ...data });
  }

  static async getProductBundles() {
    return BaseService.getList("Product Bundle", {
      fields: ["name", "new_item_code", "description"],
      limit_page_length: 50,
    });
  }

  static async createProductBundle(data: any) {
    return BaseService.insert({ doctype: "Product Bundle", ...data });
  }

  static async getShippingRules() {
    return BaseService.getList("Shipping Rule", {
      fields: ["name", "label", "shipping_amount", "calculate_based_on"],
      limit_page_length: 50,
    });
  }

  static async createShippingRule(data: any) {
    return BaseService.insert({ doctype: "Shipping Rule", ...data });
  }
}
