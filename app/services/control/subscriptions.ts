/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

import { ControlBaseService } from "./base";
import { getControlClient } from "@/app/lib/client"; // For get_list with client fallback if needed, or special calls

export class SubscriptionService {
  static async getCompanySubscriptions() {
    return ControlBaseService.getList("Company Subscription", {
      fields: ["name", "company", "plan", "start_date", "end_date", "status"],
      order_by: "modified desc",
    });
  }

  static async getSubscriptionPlans() {
    return ControlBaseService.getList("Subscription Plan", {
      fields: [
        "name",
        "plan_name",
        "cost",
        "currency",
        "billing_interval",
        "billing_interval_count",
        "trial_period_days",
        "plan_category",
        "is_per_seat_plan",
        "base_user_count",
      ],
      order_by: "cost asc",
    });
  }

  static async getSubscriptionPlan(name: string) {
    return ControlBaseService.getDoc("Subscription Plan", name);
  }

  static async getModuleDefs() {
    return ControlBaseService.getList("Module Def", {
      fields: ["name", "app_name"],
      filters: { app_name: ["!=", ""] },
      order_by: "name asc",
    });
  }

  static async getSubscriptionSettings() {
    return ControlBaseService.getList("Subscription Settings", {
      fields: ["name", "default_currency"],
      limit: 1,
    });
  }

  static async createCompanySubscription(data: any) {
    return ControlBaseService.insert({
      doctype: "Company Subscription",
      ...data,
    });
  }

  static async updateCompanySubscription(name: string, data: any) {
    return ControlBaseService.update("Company Subscription", name, data);
  }

  static async deleteCompanySubscription(name: string) {
    return ControlBaseService.delete("Company Subscription", name);
  }

  static async createSubscriptionPlan(data: any) {
    return ControlBaseService.insert({ doctype: "Subscription Plan", ...data });
  }

  static async updateSubscriptionPlan(name: string, data: any) {
    return ControlBaseService.update("Subscription Plan", name, data);
  }

  static async deleteSubscriptionPlan(name: string) {
    return ControlBaseService.delete("Subscription Plan", name);
  }

  static async updateSubscriptionSettings(name: string, data: any) {
    return ControlBaseService.update("Subscription Settings", name, data);
  }

  static async getCompany(name: string) {
    return ControlBaseService.getDoc("Company", name);
  }

  static async getCustomers() {
    return ControlBaseService.call("frappe.client.get_list", {
      doctype: "Company",
      fields: ["name", "default_currency", "country"],
      limit_page_length: 50,
    });
  }
}
