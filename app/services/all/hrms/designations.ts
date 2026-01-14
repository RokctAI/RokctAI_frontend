import { BaseService, ServiceOptions } from "@/app/services/common/base";
import { getSystemControlClient, getClient } from "@/app/lib/client";

export interface DesignationData {
    designation_name: string;
    description?: string;
}

export class DesignationService {
    static async getList(options?: ServiceOptions) {
        // 1. Sync Logic for Designations
        await this.syncGlobalDesignations();

        // 2. Fetch Local List
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Designation",
            fields: ["name", "designation_name", "description"],
            limit_page_length: 50
        }, options);
        return response?.message || [];
    }

    private static async syncGlobalDesignations() {
        try {
            const systemClient = await getSystemControlClient();
            const client = await getClient();

            // 1. Fetch Global Designations
            const globalDesigs = await (systemClient as any).call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Designation",
                    fields: ["name", "designation_name", "description"],
                    limit_page_length: 100
                }
            });

            // 2. Sync to Tenant
            if (globalDesigs?.message) {
                for (const desig of globalDesigs.message) {
                    try {
                        await (client as any).call({
                            method: "frappe.client.insert",
                            args: {
                                doc: {
                                    doctype: "Designation",
                                    name: desig.name,
                                    designation_name: desig.designation_name,
                                    description: desig.description
                                }
                            }
                        });
                    } catch (ignore) { }
                }
            }
        } catch (e) {
            console.warn("Failed to sync global designations", e);
        }
    }

    static async create(data: DesignationData, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: {
                doctype: "Designation",
                ...data
            }
        }, options);
        return response?.message;
    }
}
