import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class RefundService {
    static async create(data: { loan: string; amount: number; type: "Excess" | "Security" }, options?: ServiceOptions) {
        const doc = {
            doctype: "Loan Refund",
            loan: data.loan,
            applicant_type: "Customer", // To be refetched if needed, but usually handled by backend
            posting_date: new Date().toISOString().split("T")[0],
            refund_amount: data.amount,
            is_excess_amount_refund: data.type === "Excess" ? 1 : 0,
            is_security_amount_refund: data.type === "Security" ? 1 : 0,
        };

        const res = await BaseService.call("frappe.client.insert", { doc: doc }, options);
        if (res?.message) {
            await BaseService.call("frappe.client.submit", { doc: res.message }, options);
        }

        return res?.message;
    }
}
