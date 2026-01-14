import { BaseService, ServiceOptions } from "@/app/services/common/base";

export interface ExpenseClaimData {
    employee: string;
    company: string;
    posting_date: string;
    expenses: {
        expense_type: string;
        amount: number;
        description?: string;
        expense_date: string;
    }[];
}

export class ExpenseService {
    static async getClaimTypes(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Expense Claim Type",
            fields: ["name", "expense_type"],
            limit_page_length: 50
        }, options);
        return response?.message || [];
    }

    static async getClaims(filters: any = {}, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Expense Claim",
            filters: filters,
            fields: ["name", "employee", "employee_name", "posting_date", "grand_total", "total_claimed_amount", "approval_status", "status"],
            limit_page_length: 50,
            order_by: "posting_date desc"
        }, options);
        return response?.message || [];
    }

    static async createClaim(data: ExpenseClaimData, options?: ServiceOptions) {
        const payload = {
            doctype: "Expense Claim",
            employee: data.employee,
            company: data.company,
            posting_date: data.posting_date,
            expenses: data.expenses // Child table
        };

        const response = await BaseService.call("frappe.client.insert", {
            doc: payload
        }, options);
        return response?.message;
    }
}
