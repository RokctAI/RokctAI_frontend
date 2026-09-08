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
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Employee",
        fields: [
          "name",
          "employee_name",
          "department",
          "designation",
          "status",
          "company",
          "image",
        ],
        limit_page_length: 50,
        order_by: "creation desc",
      },
      options,
    );
    return response?.message || [];
  }

  static async get(name: string, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get",
      {
        doctype: "Employee",
        name: name,
      },
      options,
    );
    return response?.message;
  }

  static async create(data: EmployeeData, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.insert",
      {
        doc: {
          doctype: "Employee",
          ...data,
        },
      },
      options,
    );
    return response?.message;
  }

  static async update(
    name: string,
    data: Partial<EmployeeData>,
    options?: ServiceOptions,
  ) {
    const response = await BaseService.call(
      "frappe.client.set_value",
      {
        doctype: "Employee",
        name: name,
        fieldname: data,
      },
      options,
    );
    return response?.message;
  }
}
