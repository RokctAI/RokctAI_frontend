import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class LoanService {
    static async getList(page = 1, limit = 20, filters: any = {}, options?: ServiceOptions) {
        const start = (page - 1) * limit;
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Loan",
            fields: ["name", "applicant", "loan_amount", "status", "loan_product", "posting_date", "total_payment", "total_amount_paid", "branch"],
            filters: filters,
            limit_start: start,
            limit_page_length: limit,
            order_by: "creation desc"
        }, options);

        const countRes = await BaseService.call("frappe.client.get_value", {
            doctype: "Loan",
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
            doctype: "Loan",
            name: id
        }, options);
        return response?.message;
    }

    static async getRepaymentSchedule(loanId: string, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get", {
            doctype: "Loan",
            name: loanId
        }, options);
        return response?.message?.repayment_schedule || [];
    }

    static async getAssetAccounts(company: string, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Account",
            filters: {
                company: company,
                root_type: "Asset",
                is_group: 0
            },
            fields: ["name", "account_name"],
            limit_page_length: 50
        }, options);
        return response?.message || [];
    }

    static async realisePawnAsset(loan: string, asset_account: string, options?: ServiceOptions) {
        const response = await BaseService.call("core.rlending.asset_realisation.realise_pawn_asset", {
            loan_name: loan,
            asset_account: asset_account
        }, options);
        return response?.message;
    }

    static async disburse(loanId: string, postingDate?: string, options?: ServiceOptions) {
        // Fetch loan first to get details needed for args
        // Using custom wrapper which handles Mobile App logic if needed
        const response = await BaseService.call("core.rlending.api.loan.disburse_loan", {
            loan_application: loanId
        }, options);

        return typeof response?.message === 'string' ? response.message : "Loan Disbursed Successfully";
    }

    static async releaseSecurity(loanId: string, options?: ServiceOptions) {
        // Standard Lending App Function
        const response = await BaseService.call("lending.loan_management.doctype.loan.loan.unpledge_security", {
            "loan": loanId, "as_dict": 1
        }, options);

        if (response?.message) {
            const newDoc = await BaseService.call("frappe.client.insert", { doc: response.message }, options);
            if (newDoc?.message) {
                await BaseService.call("frappe.client.submit", { doc: newDoc.message }, options);
            }
        }
        return "Security Released Successfully";
    }

    static async getTimeline(loanId: string, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Comment",
            filters: {
                reference_doctype: "Loan",
                reference_name: loanId
            },
            fields: ["name", "content", "owner", "creation", "comment_type", "subject"],
            order_by: "creation desc",
            limit_page_length: 50
        }, options);
        return response?.message || [];
    }
}
