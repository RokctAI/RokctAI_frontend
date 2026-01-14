import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class ApplicationService {
    static async getList(page = 1, limit = 20, options?: ServiceOptions) {
        const start = (page - 1) * limit;
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Loan Application",
            fields: ["name", "applicant", "applicant_type", "loan_amount", "status", "loan_product", "posting_date", "rate_of_interest", "workflow_state", "owner", "risk_level"],
            limit_start: start,
            limit_page_length: limit,
            order_by: "creation desc"
        }, options);

        const countRes = await BaseService.call("frappe.client.get_value", {
            doctype: "Loan Application",
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

    static async get(id: string, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get", {
            doctype: "Loan Application",
            name: id
        }, options);
        return response?.message;
    }

    static async create(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: { doctype: "Loan Application", ...data }
        }, options);
        return response?.message;
    }

    static async update(name: string, data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.set_value", {
            doctype: "Loan Application",
            name: name,
            fieldname: data
        }, options);
        return response?.message;
    }
}
