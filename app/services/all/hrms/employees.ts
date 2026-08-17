/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
