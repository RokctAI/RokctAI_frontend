import { BaseService } from "@/app/services/common/base";

export class CommercialService {
    // --- CONTRACTS ---
    static async getContracts(page = 1, limit = 20) {
        const start = (page - 1) * limit;
        return BaseService.getList("Contract", {
            fields: ["name", "party_name", "status", "start_date", "end_date", "party_type"],
            limit_start: start,
            limit_page_length: limit,
            order_by: "creation desc"
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
            limit_page_length: 50
        });
    }

    static async createSubscriptionPlan(data: any) {
        return BaseService.insert({ doctype: "Subscription Plan", ...data });
    }

    static async getSubscriptions() {
        return BaseService.getList("Subscription", {
            fields: ["name", "party_type", "party", "status", "start_date"],
            limit_page_length: 50,
            order_by: "creation desc"
        });
    }

    static async createSubscription(data: any) {
        return BaseService.insert({ doctype: "Subscription", ...data });
    }
}
