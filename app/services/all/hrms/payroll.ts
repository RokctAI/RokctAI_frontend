import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class PayrollService {
    static async getSalarySlips(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Salary Slip",
            fields: ["name", "employee", "employee_name", "start_date", "end_date", "gross_pay", "total_deduction", "net_pay", "status"],
            limit_page_length: 50,
            order_by: "start_date desc"
        }, options);
        return response?.message || [];
    }

    static async getSalarySlip(name: string, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get", {
            doctype: "Salary Slip",
            name: name
        }, options);
        return response?.message;
    }

    static async getSalaryStructures(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Salary Structure",
            fields: ["name", "company", "is_active", "payroll_frequency", "currency"],
            filters: { is_active: "Yes" }
        }, options);
        return response?.message || [];
    }

    static async createSalarySlip(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: {
                doctype: "Salary Slip",
                ...data
            }
        }, options);
        return response?.message;
    }
}
