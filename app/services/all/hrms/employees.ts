import { BaseService, ServiceOptions } from "@/app/services/common/base";

export interface EmployeeData {
    first_name: string;
    last_name?: string;
    company: string;
    department?: string;
    designation?: string;
    date_of_joining?: string;
    status: "Active" | "Left" | "Suspended";
    gender?: "Male" | "Female" | "Other" | "Prefer not to say";
    date_of_birth?: string;
    contact_email?: string;
}

export class EmployeeService {
    static async getList(options?: ServiceOptions) {
        // Using explicit call method via BaseService helper
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Employee",
            fields: ["name", "employee_name", "department", "designation", "status", "company", "image"],
            limit_page_length: 50,
            order_by: "creation desc"
        }, options);
        return response?.message || [];
    }

    static async get(name: string, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get", {
            doctype: "Employee",
            name: name
        }, options);
        return response?.message;
    }

    static async create(data: EmployeeData, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: {
                doctype: "Employee",
                ...data
            }
        }, options);
        return response?.message;
    }

    static async update(name: string, data: Partial<EmployeeData>, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.set_value", {
            doctype: "Employee",
            name: name,
            fieldname: data
        }, options);
        return response?.message;
    }
}
