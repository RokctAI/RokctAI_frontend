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

export class TelephonyService {
  static async getTelephonySettings() {
    return ControlBaseService.getList("Telephony Settings", {
      fields: ["name", "provider", "api_key"],
      limit: 1,
    });
  }

  static async getTelephonyCustomers() {
    return ControlBaseService.getList("Telephony Customer", {
      fields: ["name", "customer_name", "phone_number", "status"],
      order_by: "modified desc",
    });
  }

  static async getTelephonySubscriptions() {
    return ControlBaseService.getList("Telephony Subscription", {
      fields: ["name", "customer", "plan", "status"],
      order_by: "modified desc",
    });
  }

  static async getTelephonyTransactions() {
    return ControlBaseService.getList("Telephony Transaction", {
      fields: ["name", "type", "amount", "date"],
      order_by: "date desc",
    });
  }

  static async getAvailableDIDs() {
    return ControlBaseService.getList("Available DID", {
      fields: ["name", "did_number", "country", "status"],
      order_by: "modified desc",
    });
  }

  static async updateTelephonySettings(name: string, data: any) {
    return ControlBaseService.update("Telephony Settings", name, data);
  }

  static async createTelephonyCustomer(data: any) {
    return ControlBaseService.insert({
      doctype: "Telephony Customer",
      ...data,
    });
  }

  static async updateTelephonyCustomer(name: string, data: any) {
    return ControlBaseService.update("Telephony Customer", name, data);
  }

  static async deleteTelephonyCustomer(name: string) {
    return ControlBaseService.delete("Telephony Customer", name);
  }

  static async createTelephonySubscription(data: any) {
    return ControlBaseService.insert({
      doctype: "Telephony Subscription",
      ...data,
    });
  }

  static async updateTelephonySubscription(name: string, data: any) {
    return ControlBaseService.update("Telephony Subscription", name, data);
  }

  static async deleteTelephonySubscription(name: string) {
    return ControlBaseService.delete("Telephony Subscription", name);
  }

  static async createAvailableDID(data: any) {
    return ControlBaseService.insert({ doctype: "Available DID", ...data });
  }

  static async updateAvailableDID(name: string, data: any) {
    return ControlBaseService.update("Available DID", name, data);
  }

  static async deleteAvailableDID(name: string) {
    return ControlBaseService.delete("Available DID", name);
  }
}
