import { BaseService } from "@/app/services/common/base";
import { PurchaseInvoiceData } from "@/app/actions/handson/all/accounting/purchases/types";

export class PurchaseService {
    static async getList(options?: any) {
        return BaseService.getList("Purchase Invoice", {
            fields: ["name", "supplier_name", "grand_total", "status", "due_date", "posting_date"],
            limit_page_length: 50,
            order_by: "creation desc",
            ...options
        });
    }

    static async create(data: PurchaseInvoiceData) {
        return BaseService.insert({ doctype: "Purchase Invoice", ...data });
    }

    static async delete(name: string) {
        return BaseService.delete("Purchase Invoice", name);
    }
}
