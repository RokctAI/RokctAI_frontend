import { BaseService } from "@/app/services/common/base";

export class MarketingService {
    // --- CAMPAIGNS ---
    static async getEmailCampaigns(page = 1, limit = 20) {
        const start = (page - 1) * limit;
        return BaseService.getList("Email Campaign", {
            fields: ["name", "campaign_name", "start_date", "status", "email_campaign_for", "recipient"],
            limit_start: start,
            limit_page_length: limit,
            order_by: "creation desc"
        });
    }

    static async createEmailCampaign(data: any) {
        return BaseService.insert({ doctype: "Email Campaign", ...data });
    }

    // --- PROSPECTS ---
    static async getProspects(page = 1, limit = 20) {
        const start = (page - 1) * limit;
        return BaseService.getList("Prospect", {
            fields: ["name", "company_name", "industry", "customer_group", "territory"],
            limit_start: start,
            limit_page_length: limit,
            order_by: "creation desc"
        });
    }

    static async getProspect(id: string) {
        return BaseService.getDoc("Prospect", id);
    }

    static async createProspect(data: any) {
        return BaseService.insert({ doctype: "Prospect", ...data });
    }

    static async updateProspect(name: string, data: any) {
        return BaseService.setValue("Prospect", name, data);
    }

    static async deleteProspect(name: string) {
        return BaseService.delete("Prospect", name);
    }
}
