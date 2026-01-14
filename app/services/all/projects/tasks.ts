import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class TaskService {
    static async getList(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Task",
            fields: ["name", "subject", "status", "priority", "project", "exp_end_date"],
            limit_page_length: 50,
            order_by: "creation desc"
        }, options);
        return response?.message || [];
    }

    static async create(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: { doctype: "Task", ...data }
        }, options);
        return response?.message;
    }

    static async getUsers(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "User",
            filters: {
                enabled: 1,
                user_type: "System User"
            },
            fields: ["name", "full_name", "user_image", "email"],
            limit_page_length: 50
        }, options);
        return response?.message || [];
    }
}
