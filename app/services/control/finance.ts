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
