import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class PerformanceService {
    static async getGoals(filters: any = {}, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Goal",
            filters: filters,
            fields: ["name", "employee", "employee_name", "goal", "status", "start_date", "end_date", "progress"],
            order_by: "creation desc",
            limit_page_length: 100
        }, options);
        return response?.message || [];
    }

    static async createGoal(data: any, options?: ServiceOptions) {
        // Warning: The original code used (client as any).insert_doc("Goal", data) which might be a custom helper or just a direct wrapper for insert.
        // Assuming frappe.client.insert works for Goal doctype.
        const response = await BaseService.call("frappe.client.insert", {
            doc: {
                doctype: "Goal",
                ...data
            }
        }, options);
        return response?.message;
    }

    static async updateGoal(name: string, data: any, options?: ServiceOptions) {
        // Warning: Original code used update_doc. Mapped to set_value here.
        // If update_doc was providing more than field updates (e.g. child tables), we might need to check.
        // But usually set_value or save can handle this. Using set_value for now.
        const response = await BaseService.call("frappe.client.set_value", {
            doctype: "Goal",
            name: name,
            fieldname: data
        }, options);
        return response?.message;
    }

    static async getAppraisals(filters: any = {}, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Appraisal",
            filters: filters,
            fields: ["name", "employee", "employee_name", "status", "appraisal_cycle", "final_score", "remarks"],
            order_by: "creation desc",
            limit_page_length: 100
        }, options);
        return response?.message || [];
    }

    static async createAppraisal(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: {
                doctype: "Appraisal",
                ...data
            }
        }, options);
        return response?.message;
    }

    static async updateAppraisal(name: string, data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.set_value", {
            doctype: "Appraisal",
            name: name,
            fieldname: data
        }, options);
        return response?.message;
    }
}
