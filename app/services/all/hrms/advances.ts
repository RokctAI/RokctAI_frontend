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

export interface EmployeeAdvanceData {
  employee: string;
  company: string;
  posting_date: string;
  purpose: string;
  advance_amount: number;
  repay_from_salary: boolean;
}

export class AdvanceService {
  static async getList(options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Employee Advance",
        fields: [
          "name",
          "employee",
          "employee_name",
          "posting_date",
          "advance_amount",
          "paid_amount",
          "status",
          "purpose",
        ],
        limit_page_length: 50,
        order_by: "posting_date desc",
      },
      options,
    );
    return response?.message || [];
  }

  static async create(data: EmployeeAdvanceData, options?: ServiceOptions) {
    const payload = {
      doctype: "Employee Advance",
      employee: data.employee,
      company: data.company,
      posting_date: data.posting_date,
      purpose: data.purpose,
      advance_amount: data.advance_amount,
      repay_unclaimed_amount_from_salary: data.repay_from_salary ? 1 : 0,
    };

    const response = await BaseService.call(
      "frappe.client.insert",
      {
        doc: payload,
      },
      options,
    );
    return response?.message;
  }
}
