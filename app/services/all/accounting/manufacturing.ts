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

export class ManufacturingService {
  // --- BOM ---
  static async getBOMs() {
    return BaseService.getList("BOM", {
      fields: ["name", "item", "is_active", "docstatus"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async getBOM(name: string) {
    return BaseService.get("BOM", name);
  }

  static async createBOM(item: string, quantity: number, items: any[]) {
    return BaseService.insert({ doctype: "BOM", item, quantity, items });
  }

  // --- WORK ORDER ---
  static async getWorkOrders() {
    return BaseService.getList("Work Order", {
      fields: [
        "name",
        "production_item",
        "qty",
        "status",
        "planned_start_date",
      ],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createWorkOrder(data: any) {
    return BaseService.insert({ doctype: "Work Order", ...data });
  }

  // --- PRODUCTION PLAN ---
  static async getProductionPlans() {
    return BaseService.getList("Production Plan", {
      fields: ["name", "status", "posting_date", "company"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createProductionPlan(data: any) {
    return BaseService.insert({ doctype: "Production Plan", ...data });
  }

  // --- SHOP FLOOR ---
  static async getShopFloorItems(doctype: string) {
    let fields = ["name"];
    if (doctype === "Workstation")
      fields = ["name", "workstation_name", "production_capacity"];
    if (doctype === "Operation") fields = ["name", "description"];
    if (doctype === "Job Card")
      fields = ["name", "work_order", "operation", "workstation", "status"];
    if (doctype === "Downtime Entry")
      fields = ["name", "workstation", "stop_reason", "from_time", "to_time"];

    return BaseService.getList(doctype, {
      fields,
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createShopFloorItem(data: any) {
    return BaseService.insert(data);
  }

  // --- ROUTING ---
  static async getRoutings() {
    return BaseService.getList("Routing", {
      fields: ["name", "routing_name", "status"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createRouting(data: any) {
    return BaseService.insert({ doctype: "Routing", ...data });
  }
}
