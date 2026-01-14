import { BaseService } from "@/app/services/common/base";
import { JournalEntryData } from "@/app/actions/handson/all/accounting/journals/types";

export class JournalService {
    static async getList(options?: any) {
        return BaseService.getList("Journal Entry", {
            fields: ["name", "voucher_type", "posting_date", "total_debit", "docstatus"],
            limit_page_length: 50,
            order_by: "creation desc",
            ...options
        });
    }

    static async getGLList(options?: any) {
        return BaseService.getList("GL Entry", {
            fields: ["name", "posting_date", "account", "party_type", "party", "debit", "credit", "voucher_type", "voucher_no"],
            limit_page_length: 100,
            order_by: "posting_date desc, creation desc",
            ...options
        });
    }

    static async create(data: JournalEntryData) {
        return BaseService.insert({ doctype: "Journal Entry", ...data });
    }

    static async setClearanceDate(name: string, date: string) {
        return BaseService.setValue("Journal Entry", name, { clearance_date: date });
    }
}
