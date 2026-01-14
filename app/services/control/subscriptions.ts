import { ControlBaseService } from "./base";
import { getControlClient } from "@/app/lib/client"; // For get_list with client fallback if needed, or special calls

export class SubscriptionService {
    static async getCompanySubscriptions() {
        return ControlBaseService.getList("Company Subscription", {
            fields: ["name", "company", "plan", "start_date", "end_date", "status"],
            order_by: "modified desc"
        });
    }

    static async getSubscriptionPlans() {
        return ControlBaseService.getList("Subscription Plan", {
            fields: ["name", "plan_name", "cost", "currency", "billing_interval", "billing_interval_count", "trial_period_days", "plan_category", "is_per_seat_plan", "base_user_count"],
            order_by: "cost asc"
        });
    }

    static async getSubscriptionPlan(name: string) {
        return ControlBaseService.getDoc("Subscription Plan", name);
    }

    static async getModuleDefs() {
        return ControlBaseService.getList("Module Def", {
            fields: ["name", "app_name"],
            filters: { "app_name": ["!=", ""] },
            order_by: "name asc"
        });
    }

    static async getSubscriptionSettings() {
        return ControlBaseService.getList("Subscription Settings", {
            fields: ["name", "default_currency"],
            limit: 1
        });
    }

    static async createCompanySubscription(data: any) {
        return ControlBaseService.insert({ doctype: "Company Subscription", ...data });
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
            limit_page_length: 50
        });
    }
}
