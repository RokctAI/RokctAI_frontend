import { BaseService } from "@/app/services/common/base";

export interface AccountData {
    name: string;
    account_name: string;
    parent_account?: string;
    report_type?: "Balance Sheet" | "Profit and Loss";
    root_type?: "Asset" | "Liability" | "Equity" | "Income" | "Expense";
    account_currency: string;
    balance?: number;
}

export class FinancialReportService {
    static async getAccountBalances(company: string) {
        const response = await BaseService.getList("Account", {
            filters: {
                company: company,
                is_group: 0
            },
            fields: ["name", "account_name", "parent_account", "report_type", "root_type", "account_currency", "balance"],
            limit_page_length: 500
        });
        return response;
    }

    static async runFinancialReport(reportName: string, filters: any) {
        const response = await BaseService.call("frappe.desk.query_report.run", {
            report_name: reportName,
            filters: filters
        });
        return response?.message;
    }
}
