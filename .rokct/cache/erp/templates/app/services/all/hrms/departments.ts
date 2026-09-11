/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { BaseService, ServiceOptions } from "@/app/services/common/base";
import { auth } from "@/app/(auth)/auth";
import { getSystemControlClient } from "@/app/lib/client";
import { gatewayCall } from "@/app/lib/gateway-rpc";

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
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Department",
        fields: ["name", "department_name", "parent_department", "company"],
        limit_page_length: 50,
      },
      options,
    );
    return response?.message || [];
  }

  private static async syncGlobalDepartments() {
    try {
      const systemClient = await getSystemControlClient();

      // 1. Fetch Global Departments. frappe-js-sdk's `call()` takes no
      // arguments, so the call goes through the gateway on the system
      // client's OWN connection: routing stays on the control site.
      const globalDepts = await gatewayCall(
        systemClient,
        "frappe.client.get_list",
        {
          doctype: "Department",
          fields: ["name", "department_name", "parent_department"],
          limit_page_length: 100,
        },
      );
      const depts: any[] = Array.isArray(globalDepts)
        ? globalDepts
        : globalDepts?.message || [];

      // 2. Sync to Tenant
      if (depts.length) {
        const session = await auth();
        const defaultCompany = (session?.user as any)?.company?.name;

        if (defaultCompany) {
          for (const dept of depts) {
            try {
              await BaseService.call("frappe.client.insert", {
                doc: {
                  doctype: "Department",
                  name: dept.name,
                  department_name: dept.department_name,
                  company: defaultCompany,
                  is_group: 0,
                },
              });
            } catch (ignore) {}
          }
        }
      }
    } catch (e) {
      console.warn("Failed to sync global departments", e);
    }
  }

  static async create(data: DepartmentData, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.insert",
      {
        doc: {
          doctype: "Department",
          ...data,
        },
      },
      options,
    );
    return response?.message;
  }
}
