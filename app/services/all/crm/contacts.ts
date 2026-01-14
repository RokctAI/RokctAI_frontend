import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class ContactService {
    static async getList(page = 1, limit = 20, options?: ServiceOptions) {
        const start = (page - 1) * limit;
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Contact",
            fields: [
                "name", "full_name", "image", "company_name", "email_id", "mobile_no", "status",
                "designation", "department", "gender", // Added helpful context fields
                "modified", "creation"
            ],
            limit_start: start,
            limit_page_length: limit,
            order_by: "creation desc"
        }, options);

        const countRes = await BaseService.call("frappe.client.get_value", {
            doctype: "Contact",
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
            doctype: "Contact",
            name: name
        }, options);
        return response?.message;
    }
}
