import { BaseService } from "@/app/services/common/base";
import { PaymentData } from "@/app/actions/handson/all/accounting/payments/types";

export class PaymentService {
    static async getList(options?: any) {
        return BaseService.getList("Payment Entry", {
            fields: ["name", "party_name", "payment_type", "paid_amount", "status", "posting_date", "clearance_date"],
            limit_page_length: 50,
            order_by: "creation desc",
            ...options
        });
    }

    static async create(data: PaymentData) {
        return BaseService.insert({ doctype: "Payment Entry", ...data });
    }

    static async get(name: string) {
        return BaseService.getDoc("Payment Entry", name);
    }

    static async cancel(name: string) {
        return BaseService.cancel("Payment Entry", name);
    }

    static async setClearanceDate(name: string, date: string) {
        return BaseService.setValue("Payment Entry", name, { clearance_date: date });
    }
}
