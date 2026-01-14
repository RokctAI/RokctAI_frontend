import { BaseService } from "@/app/services/common/base";
import { InvoiceData } from "@/app/actions/handson/all/accounting/invoices/types";

export class InvoiceService {
    static async get(name: string) {
        return BaseService.getDoc("Sales Invoice", name);
    }

    static async getList(options?: any) {
        return BaseService.getList("Sales Invoice", {
            fields: ["name", "customer_name", "grand_total", "status", "due_date"],
            limit_page_length: 50,
            order_by: "creation desc",
            ...options
        });
    }

    static async create(data: InvoiceData) {
        return BaseService.insert({ doctype: "Sales Invoice", ...data });
    }

    static async update(name: string, data: Partial<InvoiceData>) {
        return BaseService.setValue("Sales Invoice", name, data);
    }

    static async delete(name: string) {
        return BaseService.delete("Sales Invoice", name);
    }

    static async submit(name: string) {
        return BaseService.submit({ doctype: "Sales Invoice", name: name });
    }

    static async cancel(name: string) {
        return BaseService.cancel("Sales Invoice", name);
    }
}
