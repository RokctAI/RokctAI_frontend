import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class TravelService {
    static async getRequests(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Travel Request",
            fields: ["name", "employee", "employee_name", "start_date", "end_date", "purpose", "status", "total_estimated_cost"],
            limit_page_length: 50,
            order_by: "start_date desc"
        }, options);
        return response?.message || [];
    }

    static async createRequest(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: {
                doctype: "Travel Request",
                ...data
            }
        }, options);
        return response?.message;
    }
}
