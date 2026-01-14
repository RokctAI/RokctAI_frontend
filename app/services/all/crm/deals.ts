import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class OpportunityService {
    static async getList(page = 1, limit = 20, options?: ServiceOptions) {
        const start = (page - 1) * limit;
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "CRM Deal",
            fields: [
                "name", "deal_name", "organization", "deal_owner",
                "status", "currency", "annual_revenue", "probability",
                "modified", "creation"
            ],
            limit_start: start,
            limit_page_length: limit,
            order_by: "creation desc"
        }, options);

        // Helper for counting
        const countRes = await BaseService.call("frappe.client.get_value", {
            doctype: "CRM Deal",
            filters: {},
            fieldname: "count(name) as total"
        }, options);

        return {
            data: response?.message || [],
            total: countRes?.message?.total || 0,
            page,
            limit
        };
    }

    static async get(name: string, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get", {
            doctype: "CRM Deal",
            name: name
        }, options);

        const deal = response?.message;
        if (deal && deal.deal_owner) {
            const ownerRes = await BaseService.call("frappe.client.get_value", {
                doctype: "User",
                filters: { name: deal.deal_owner },
                fieldname: ["user_image", "full_name"]
            }, options);
            if (ownerRes?.message) {
                deal.deal_owner_image = ownerRes.message.user_image;
                deal.deal_owner_name = ownerRes.message.full_name;
            }
        }
        return deal;
    }

    static async create(data: any, options?: ServiceOptions) {
        // Data mapping logic should ideally be here if it's purely business logic,
        // but if it's just 'party_name' -> 'deal_name', it's fine.
        // We'll accept cleaner data or partial.
        const doc = {
            doctype: "CRM Deal",
            deal_name: data.party_name ? `${data.party_name} Deal` : "New Deal",
            organization: data.opportunity_from === "Customer" ? data.party_name : undefined,
            status: data.status,
            ...data // allow generic override
        };
        // Cleanup computed fields from spreading data if needed, but for now simple merging.
        // Actually, the action did specific mapping. Service should probably take specific args or generic doc.
        // I'll stick to generic doc creation mostly, but keeping the specific logic in service is better for reuse.

        const response = await BaseService.call("frappe.client.insert", { doc: doc }, options);
        return response?.message;
    }

    static async update(name: string, data: any, options?: ServiceOptions) {
        const doc: any = {};
        if (data.party_name) doc.deal_name = `${data.party_name} Deal`;
        if (data.status) doc.status = data.status;
        // Merge other data
        Object.assign(doc, data);

        const response = await BaseService.call("frappe.client.set_value", {
            doctype: "CRM Deal",
            name: name,
            fieldname: doc
        }, options);
        return response?.message;
    }

    static async delete(name: string, options?: ServiceOptions) {
        await BaseService.call("frappe.client.delete", {
            doctype: "CRM Deal",
            name: name
        }, options);
    }
}
