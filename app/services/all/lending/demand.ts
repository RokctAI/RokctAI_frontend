import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class DemandService {
    static async create(data: {
        loan: string;
        demand_type: "Penalty" | "Charges";
        amount: number;
        date: string;
        description?: string;
    }, options?: ServiceOptions) {

        // Fetch Loan first to get context, similar to original logic
        const loanDoc = await BaseService.call("frappe.client.get", {
            doctype: "Loan",
            name: data.loan
        }, options);

        if (!loanDoc?.message) throw new Error("Loan not found");
        const loan = loanDoc.message;

        const doc = {
            doctype: "Loan Demand",
            loan: data.loan,
            demand_type: data.demand_type,
            demand_subtype: data.demand_type === "Penalty" ? "Penalty" : "Miscellaneous",
            demand_date: data.date,
            posting_date: data.date,
            demand_amount: data.amount,
            company: loan.company,
            applicant_type: loan.applicant_type,
            applicant: loan.applicant,
            loan_product: loan.loan_product
        };

        const res = await BaseService.call("frappe.client.insert", { doc: doc }, options);
        if (res?.message) {
            await BaseService.call("frappe.client.submit", { doc: res.message }, options);
        }

        return res?.message;
    }
}
