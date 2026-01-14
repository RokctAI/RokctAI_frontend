import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class RepaymentService {
    static async getList(page = 1, limit = 20, options?: ServiceOptions) {
        const start = (page - 1) * limit;
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Loan Repayment",
            fields: ["name", "against_loan", "applicant", "amount_paid", "posting_date", "status", "principal_amount_paid", "interest_payable"],
            limit_start: start,
            limit_page_length: limit,
            order_by: "creation desc"
        }, options);

        const countRes = await BaseService.call("frappe.client.get_value", {
            doctype: "Loan Repayment",
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

    static async create(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: { doctype: "Loan Repayment", ...data }
        }, options);
        return response?.message;
    }
}
