import { ControlBaseService } from "./base";

export class FinanceService {
    static async getCustomerWallets() {
        return ControlBaseService.getList("Customer Wallet", {
            fields: ["name", "customer", "balance", "currency"],
            order_by: "modified desc"
        });
    }

    static async getWalletLedgers() {
        return ControlBaseService.getList("Wallet Ledger", {
            fields: ["name", "wallet", "amount", "transaction_type", "date"],
            order_by: "date desc"
        });
    }

    static async getTenantPayoutRequests() {
        return ControlBaseService.getList("Tenant Payout Request", {
            fields: ["name", "tenant", "amount", "status", "requested_date"],
            order_by: "requested_date desc"
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
        return ControlBaseService.insert({ doctype: "Tenant Payout Request", ...data });
    }

    static async updateTenantPayoutRequest(name: string, data: any) {
        return ControlBaseService.update("Tenant Payout Request", name, data);
    }

    static async deleteTenantPayoutRequest(name: string) {
        return ControlBaseService.delete("Tenant Payout Request", name);
    }
}
