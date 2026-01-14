import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class TimesheetService {
    static async getList(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Timesheet",
            fields: ["name", "employee_name", "total_hours", "status", "start_date"],
            limit_page_length: 50,
            order_by: "creation desc"
        }, options);
        return response?.message || [];
    }

    static async create(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: { doctype: "Timesheet", ...data }
        }, options);
        return response?.message;
    }

    static async getActivityTypes(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Activity Type",
            fields: ["name", "activity_type", "costing_rate"],
            limit_page_length: 50
        }, options);
        return response?.message || [];
    }

    static async createActivityType(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: { doctype: "Activity Type", ...data }
        }, options);
        return response?.message;
    }
}
