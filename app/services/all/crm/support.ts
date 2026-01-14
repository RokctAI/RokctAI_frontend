import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class SupportService {
    static async getIssues(page = 1, limit = 20, options?: ServiceOptions) {
        const start = (page - 1) * limit;
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Issue",
            fields: ["name", "subject", "status", "priority", "raised_by", "opening_date", "resolution_date"],
            limit_start: start,
            limit_page_length: limit,
            order_by: "opening_date desc"
        }, options);

        const countRes = await BaseService.call("frappe.client.get_value", {
            doctype: "Issue",
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

    static async getIssue(name: string, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get", {
            doctype: "Issue",
            name: name
        }, options);
        return response?.message;
    }

    static async createIssue(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: { doctype: "Issue", ...data }
        }, options);
        return response?.message;
    }

    static async updateIssue(name: string, data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.set_value", {
            doctype: "Issue",
            name: name,
            fieldname: data
        }, options);
        return response?.message;
    }

    static async deleteIssue(name: string, options?: ServiceOptions) {
        await BaseService.call("frappe.client.delete", {
            doctype: "Issue",
            name: name
        }, options);
    }

    // SLA Methods
    static async getServiceLevelAgreements(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Service Level Agreement",
            fields: ["name", "service_level", "default_priority", "enabled"],
            limit_page_length: 50
        }, options);
        return response?.message || [];
    }

    static async createServiceLevelAgreement(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: { doctype: "Service Level Agreement", ...data }
        }, options);
        return response?.message;
    }

    // Warranty Methods
    static async getWarrantyClaims(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Warranty Claim",
            fields: ["name", "customer", "item_code", "status", "claim_date", "issue_description"],
            limit_page_length: 50,
            order_by: "claim_date desc"
        }, options);
        return response?.message || [];
    }

    static async createWarrantyClaim(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: { doctype: "Warranty Claim", ...data }
        }, options);
        return response?.message;
    }

    // Notes
    static async getNotes(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Note",
            fields: ["name", "title", "public", "notify_on_login"],
            limit_page_length: 50,
            order_by: "creation desc"
        }, options);
        return response?.message || [];
    }

    static async createNote(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: { doctype: "Note", ...data }
        }, options);
        return response?.message;
    }

    static async getIssueNotes(issueName: string, options?: ServiceOptions) {
        // Fetch Communications (Comments) linked to the Issue
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Communication",
            filters: {
                reference_doctype: "Issue",
                reference_name: issueName,
                communication_type: "Comment" // Fetch comments specifically
            },
            fields: ["name", "subject", "content", "sender", "creation"],
            order_by: "creation desc"
        }, options);
        return response?.message || [];
    }


}
