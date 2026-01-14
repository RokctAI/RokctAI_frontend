import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class LoanService {
    static async getList(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Loan",
            fields: ["name", "applicant", "loan_amount", "status"],
            limit_page_length: 50
        }, options);
        return response?.message || [];
    }

    static async create(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: {
                doctype: "Loan",
                ...data
            }
        }, options);
        return response?.message;
    }
}
