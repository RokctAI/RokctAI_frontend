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
