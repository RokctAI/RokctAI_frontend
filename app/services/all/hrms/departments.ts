import { BaseService, ServiceOptions } from "@/app/services/common/base";
import { auth } from "@/auth";
import { getSystemControlClient, getClient } from "@/app/lib/client";

export interface DepartmentData {
    department_name: string;
    parent_department?: string;
    company: string;
}

export class DepartmentService {
    /**
     * Fetches departments, syncing from Global Control Plane first if needed.
     */
    static async getList(options?: ServiceOptions) {
        // 1. Sync Logic (specific to Departments in this implementation)
        // We can keep this logic encapsulated here in the Service.
        await this.syncGlobalDepartments();

        // 2. Fetch Local List
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Department",
            fields: ["name", "department_name", "parent_department", "company"],
            limit_page_length: 50
        }, options);
        return response?.message || [];
    }

    private static async syncGlobalDepartments() {
        try {
            const systemClient = await getSystemControlClient();
            const client = await getClient();

            // 1. Fetch Global Departments
            const globalDepts = await (systemClient as any).call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Department",
                    fields: ["name", "department_name", "parent_department"],
                    limit_page_length: 100
                }
            });

            // 2. Sync to Tenant
            if (globalDepts?.message) {
                const session = await auth();
                const defaultCompany = (session?.user as any)?.company?.name;

                if (defaultCompany) {
                    for (const dept of globalDepts.message) {
                        try {
                            await (client as any).call({
                                method: "frappe.client.insert",
                                args: {
                                    doc: {
                                        doctype: "Department",
                                        name: dept.name,
                                        department_name: dept.department_name,
                                        company: defaultCompany,
                                        is_group: 0
                                    }
                                }
                            });
                        } catch (ignore) { }
                    }
                }
            }
        } catch (e) {
            console.warn("Failed to sync global departments", e);
        }
    }

    static async create(data: DepartmentData, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: {
                doctype: "Department",
                ...data
            }
        }, options);
        return response?.message;
    }
}
