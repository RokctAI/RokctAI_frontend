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

export class CommercialService {
  // --- CONTRACTS ---
  static async getContracts(page = 1, limit = 20) {
    const start = (page - 1) * limit;
    return BaseService.getList("Contract", {
      fields: [
        "name",
        "party_name",
        "status",
        "start_date",
        "end_date",
        "party_type",
      ],
      limit_start: start,
      limit_page_length: limit,
      order_by: "creation desc",
    });
  }

  static async getContract(id: string) {
    return BaseService.getDoc("Contract", id);
  }

  static async createContract(data: any) {
    return BaseService.insert({ doctype: "Contract", ...data });
  }

  // --- SUBSCRIPTIONS ---
  static async getSubscriptionPlans() {
    return BaseService.getList("Subscription Plan", {
      fields: ["name", "plan_name", "currency", "cost"],
      limit_page_length: 50,
    });
  }

  static async createSubscriptionPlan(data: any) {
    return BaseService.insert({ doctype: "Subscription Plan", ...data });
  }

  static async getSubscriptions() {
    return BaseService.getList("Subscription", {
      fields: ["name", "party_type", "party", "status", "start_date"],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createSubscription(data: any) {
    return BaseService.insert({ doctype: "Subscription", ...data });
  }
}
