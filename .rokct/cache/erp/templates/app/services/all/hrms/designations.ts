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
import { getSystemControlClient } from "@/app/lib/client";
import { gatewayCall } from "@/app/lib/gateway-rpc";

export interface DesignationData {
  designation_name: string;
  description?: string;
}

export class DesignationService {
  static async getList(options?: ServiceOptions) {
    // 1. Sync Logic for Designations
    await this.syncGlobalDesignations();

    // 2. Fetch Local List
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Designation",
        fields: ["name", "designation_name", "description"],
        limit_page_length: 50,
      },
      options,
    );
    return response?.message || [];
  }

  private static async syncGlobalDesignations() {
    try {
      const systemClient = await getSystemControlClient();

      // 1. Fetch Global Designations. frappe-js-sdk's `call()` takes no
      // arguments, so the call goes through the gateway on the system
      // client's OWN connection: routing stays on the control site.
      const globalDesigs = await gatewayCall(
        systemClient,
        "frappe.client.get_list",
        {
          doctype: "Designation",
          fields: ["name", "designation_name", "description"],
          limit_page_length: 100,
        },
      );
      const desigs: any[] = Array.isArray(globalDesigs)
        ? globalDesigs
        : globalDesigs?.message || [];

      // 2. Sync to Tenant
      for (const desig of desigs) {
        try {
          await BaseService.call("frappe.client.insert", {
            doc: {
              doctype: "Designation",
              name: desig.name,
              designation_name: desig.designation_name,
              description: desig.description,
            },
          });
        } catch (ignore) {}
      }
    } catch (e) {
      console.warn("Failed to sync global designations", e);
    }
  }

  static async create(data: DesignationData, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.insert",
      {
        doc: {
          doctype: "Designation",
          ...data,
        },
      },
      options,
    );
    return response?.message;
  }
}
