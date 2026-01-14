import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class CompanyService {
    static async getList(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Company",
            fields: ["name", "company_name"],
            limit_page_length: 50
        }, options);
        return response?.message || [];
    }
}
