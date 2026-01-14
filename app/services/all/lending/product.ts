import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class ProductService {
    static async getList(options?: ServiceOptions) {
        // Using existing backend method
        const response = await BaseService.call("rokct.rlending.api.product.get_loan_product_list", {}, options);
        return response?.message || [];
    }

    static async get(name: string, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get", {
            doctype: "Loan Product",
            name: name
        }, options);
        return response?.message;
    }

    static async create(data: any, options?: ServiceOptions) {
        // Create logic for seed product
        // Check existence
        const existing = await BaseService.call("frappe.client.get_value", {
            doctype: "Loan Product",
            filters: { product_name: data.product_name },
            fieldname: "name"
        }, options);

        if (existing?.message?.name) {
            throw new Error("Product already exists.");
        }

        const response = await BaseService.call("frappe.client.insert", {
            doc: { doctype: "Loan Product", ...data }
        }, options);
        return response?.message;
    }

    static async isControlSite(options?: ServiceOptions) {
        const response = await BaseService.call("rokct.utils.is_control_site", {}, options);
        return response?.message === true;
    }
}
