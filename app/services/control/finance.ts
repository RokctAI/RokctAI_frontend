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

export class FinanceService {
  static async getCustomerWallets() {
    return ControlBaseService.getList("Customer Wallet", {
      fields: ["name", "customer", "balance", "currency"],
      order_by: "modified desc",
    });
  }

  static async getWalletLedgers() {
    return ControlBaseService.getList("Wallet Ledger", {
      fields: ["name", "wallet", "amount", "transaction_type", "date"],
      order_by: "date desc",
    });
  }

  static async getTenantPayoutRequests() {
    return ControlBaseService.getList("Tenant Payout Request", {
      fields: ["name", "tenant", "amount", "status", "requested_date"],
      order_by: "requested_date desc",
    });
  }

  static async createCustomerWallet(data: any) {
    return ControlBaseService.insert({ doctype: "Customer Wallet", ...data });
  }

  static async updateCustomerWallet(name: string, data: any) {
    return ControlBaseService.update("Customer Wallet", name, data);
  }

  static async deleteCustomerWallet(name: string) {
    return ControlBaseService.delete("Customer Wallet", name);
  }

  static async createWalletLedger(data: any) {
    return ControlBaseService.insert({ doctype: "Wallet Ledger", ...data });
  }

  static async updateWalletLedger(name: string, data: any) {
    return ControlBaseService.update("Wallet Ledger", name, data);
  }

  static async deleteWalletLedger(name: string) {
    return ControlBaseService.delete("Wallet Ledger", name);
  }

  static async createTenantPayoutRequest(data: any) {
    return ControlBaseService.insert({
      doctype: "Tenant Payout Request",
      ...data,
    });
  }

  static async updateTenantPayoutRequest(name: string, data: any) {
    return ControlBaseService.update("Tenant Payout Request", name, data);
  }

  static async deleteTenantPayoutRequest(name: string) {
    return ControlBaseService.delete("Tenant Payout Request", name);
  }
}
