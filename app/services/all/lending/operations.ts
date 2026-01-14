import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class OperationsService {
    static async runInterestAccrual(options?: any) {
        const response = await BaseService.call("lending.loan_management.doctype.process_loan_interest_accrual.process_loan_interest_accrual.process_loan_interest_accrual_for_loans", {
            term_loan: 0 // Optional filter
        }, options);
        return response;
    }

    static async runSecurityShortfallCheck(options?: any) {
        await BaseService.call("lending.loan_management.doctype.process_loan_security_shortfall.process_loan_security_shortfall.create_process_loan_security_shortfall", {}, options);
    }

    static async runLoanClassification(options?: any) {
        await BaseService.call("lending.loan_management.doctype.process_loan_classification.process_loan_classification.create_process_loan_classification", {}, options);
    }

    static async getProcessLogs(limit = 10, options?: ServiceOptions) {
        const interest = await BaseService.call("frappe.client.get_list", {
            doctype: "Process Loan Interest Accrual",
            fields: ["name", "posting_date", "creation", "status", "company"],
            order_by: "creation desc",
            limit_page_length: limit
        }, options);

        const shortfall = await BaseService.call("frappe.client.get_list", {
            doctype: "Process Loan Security Shortfall",
            fields: ["name", "update_time as posting_date", "creation", "status"],
            order_by: "creation desc",
            limit_page_length: limit
        }, options);

        const classification = await BaseService.call("frappe.client.get_list", {
            doctype: "Process Loan Classification",
            fields: ["name", "creation", "status"],
            order_by: "creation desc",
            limit_page_length: limit
        }, options);

        // Combine and Sort Logic is better done in Service or Action? 
        // Service should return raw data or domain objects. Keeping logic here makes it reusable.

        const combined = [
            ...(interest?.message || []).map((d: any) => ({ ...d, type: "Interest Accrual" })),
            ...(shortfall?.message || []).map((d: any) => ({ ...d, type: "Security Shortfall" })),
            ...(classification?.message || []).map((d: any) => ({ ...d, type: "Classification" }))
        ].sort((a: any, b: any) => new Date(b.creation).getTime() - new Date(a.creation).getTime())
            .slice(0, limit);

        return combined;
    }
}
