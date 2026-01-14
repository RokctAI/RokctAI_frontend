import { BaseService, ServiceOptions } from "@/app/services/common/base";
import { auth } from "@/auth";
import { ReportService } from "./reports";

// Type definitions kept here for now or shared type file
export interface NCRForm40Data {
    entity_info: {
        registration_number: string;
        financial_year_end: string;
    };
    income_statement: {
        revenue: {
            interest_income_nca: number; // 1.1
            initiation_service_fees: number; // 1.2
            credit_insurance_income: number; // 1.3
            bad_debts_recovered: number; // 1.4
            other_income_nca: number; // 1.5
            total_nca_revenue: number; // 1.6
            other_interest_income: number; // 1.7
            other_non_nca_income: number; // 1.8
            total_revenue: number; // 1.9
        };
        expenses: {
            bad_debt_write_offs: number; // 2.1
            provision_change: number; // 2.2
            interest_paid: number; // 2.3
            salaries_wages: number; // 2.5
            operational_expenses: number; // 2.8 (Other)
            total_expenses: number; // 2.9
        };
        net_income: {
            net_income_after_tax: number; // 6
        };
    };
    balance_sheet: {
        equity: number; // 9.1
        total_debt: number; // 9.2
        gross_debtors: number; // 9.5
        provision_bad_debt: number; // 9.6
        net_debtors: number; // 9.7
        total_assets: number; // 11
    };
    bee: {
        hdp_ownership_percent: number;
        other_ownership_percent: number;
    };
    employment: {
        total_employees: number;
        hdp_employees: number;
        agent_employees: number;
        hdp_percent: number;
    };
}


export class NCRService {
    static async getForm40Data(filters: any = {}, options?: ServiceOptions): Promise<NCRForm40Data> {
        // --- DATA GATHERING ---

        // 1. Company/Entity Info
        const session = await auth();
        // Trust the session data. If license is missing there, the company is not licensed.
        const registration_number = (session?.user as any)?.company?.license || "N/A";

        // 2. Interest Income (1.1)
        const interestReport = await ReportService.getReport("Loan Interest Report", filters, options);
        const interest_income_nca = interestReport.data?.reduce((sum: number, row: any) => sum + (row.interest_amount || 0), 0) || 0;

        // 3. Fees (1.2) - Placeholder logic as per original
        const initiation_service_fees = 0;

        // 4. Bad Debts (2.1)
        const writeOffsResponse = await BaseService.call("frappe.client.get_list", {
            doctype: "Loan Write Off",
            fields: ["amount"],
            filters: { ...filters, docstatus: 1 }
        }, options);
        const bad_debt_write_offs = (writeOffsResponse?.message || []).reduce((sum: number, row: any) => sum + (row.amount || 0), 0);

        // 5. Debtors Book (9.5)
        const activeLoansResponse = await BaseService.call("frappe.client.get_list", {
            doctype: "Loan",
            fields: ["total_payment", "total_amount_paid", "status", "total_principal_remaining"],
            filters: {
                status: ["in", ["Disbursed", "Partially Paid", "Overdue"]],
                ...filters
            },
            limit_page_length: 5000
        }, options);

        let gross_debtors = 0;
        (activeLoansResponse?.message || []).forEach((loan: any) => {
            const outstanding = (loan.total_payment || 0) - (loan.total_amount_paid || 0);
            gross_debtors += outstanding;
        });

        // Calculations
        const total_nca_revenue = interest_income_nca + initiation_service_fees;
        const total_revenue = total_nca_revenue;

        // Expenses
        const salaries_wages = 0;
        const total_expenses = bad_debt_write_offs + salaries_wages;

        // Balance Sheet
        const provision_bad_debt = 0;
        const net_debtors = gross_debtors - provision_bad_debt;

        // Equity/Assets proxy
        const total_assets = net_debtors;

        return {
            entity_info: {
                registration_number,
                financial_year_end: "February"
            },
            income_statement: {
                revenue: {
                    interest_income_nca,
                    initiation_service_fees,
                    credit_insurance_income: 0,
                    bad_debts_recovered: 0,
                    other_income_nca: 0,
                    total_nca_revenue,
                    other_interest_income: 0,
                    other_non_nca_income: 0,
                    total_revenue
                },
                expenses: {
                    bad_debt_write_offs,
                    provision_change: 0,
                    interest_paid: 0,
                    salaries_wages,
                    operational_expenses: 0,
                    total_expenses
                },
                net_income: {
                    net_income_after_tax: total_revenue - total_expenses
                }
            },
            balance_sheet: {
                equity: 0,
                total_debt: 0,
                gross_debtors,
                provision_bad_debt,
                net_debtors,
                total_assets
            },
            bee: {
                hdp_ownership_percent: 0,
                other_ownership_percent: 100
            },
            employment: {
                total_employees: 0,
                hdp_employees: 0,
                agent_employees: 0,
                hdp_percent: 0
            }
        };
    }
}
