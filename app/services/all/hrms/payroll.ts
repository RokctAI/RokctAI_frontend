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

export class PayrollService {
  static async getSalarySlips(options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Salary Slip",
        fields: [
          "name",
          "employee",
          "employee_name",
          "start_date",
          "end_date",
          "gross_pay",
          "total_deduction",
          "net_pay",
          "status",
        ],
        limit_page_length: 50,
        order_by: "start_date desc",
      },
      options,
    );
    return response?.message || [];
  }

  static async getSalarySlip(name: string, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get",
      {
        doctype: "Salary Slip",
        name: name,
      },
      options,
    );
    return response?.message;
  }

  static async getSalaryStructures(options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Salary Structure",
        fields: [
          "name",
          "company",
          "is_active",
          "payroll_frequency",
          "currency",
        ],
        filters: { is_active: "Yes" },
      },
      options,
    );
    return response?.message || [];
  }

  static async createSalarySlip(data: any, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.insert",
      {
        doc: {
          doctype: "Salary Slip",
          ...data,
        },
      },
      options,
    );
    return response?.message;
  }
}
