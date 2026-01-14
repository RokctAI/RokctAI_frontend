import { BaseService, ServiceOptions } from "@/app/services/common/base";

export interface EmployeeAdvanceData {
    employee: string;
    company: string;
    posting_date: string;
    purpose: string;
    advance_amount: number;
    repay_from_salary: boolean;
}

export class AdvanceService {
    static async getList(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Employee Advance",
            fields: ["name", "employee", "employee_name", "posting_date", "advance_amount", "paid_amount", "status", "purpose"],
            limit_page_length: 50,
            order_by: "posting_date desc"
        }, options);
        return response?.message || [];
    }

    static async create(data: EmployeeAdvanceData, options?: ServiceOptions) {
        const payload = {
            doctype: "Employee Advance",
            employee: data.employee,
            company: data.company,
            posting_date: data.posting_date,
            purpose: data.purpose,
            advance_amount: data.advance_amount,
            repay_unclaimed_amount_from_salary: data.repay_from_salary ? 1 : 0
        };

        const response = await BaseService.call("frappe.client.insert", {
            doc: payload
        }, options);
        return response?.message;
    }
}
