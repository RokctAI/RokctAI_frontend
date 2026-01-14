import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class SeparationService {
    static async getList(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Employee Separation",
            fields: ["name", "employee", "employee_name", "resignation_letter_date", "status", "exit_interview_summary"],
            limit_page_length: 50,
            order_by: "resignation_letter_date desc"
        }, options);
        return response?.message || [];
    }

    static async create(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: {
                doctype: "Employee Separation",
                ...data
            }
        }, options);
        return response?.message;
    }
}
