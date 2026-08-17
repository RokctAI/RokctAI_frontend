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

export interface ExpenseClaimData {
  employee: string;
  company: string;
  posting_date: string;
  expenses: {
    expense_type: string;
    amount: number;
    description?: string;
    expense_date: string;
  }[];
}

export class ExpenseService {
  static async getClaimTypes(options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Expense Claim Type",
        fields: ["name", "expense_type"],
        limit_page_length: 50,
      },
      options,
    );
    return response?.message || [];
  }

  static async getClaims(filters: any = {}, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Expense Claim",
        filters: filters,
        fields: [
          "name",
          "employee",
          "employee_name",
          "posting_date",
          "grand_total",
          "total_claimed_amount",
          "approval_status",
          "status",
        ],
        limit_page_length: 50,
        order_by: "posting_date desc",
      },
      options,
    );
    return response?.message || [];
  }

  static async createClaim(data: ExpenseClaimData, options?: ServiceOptions) {
    const payload = {
      doctype: "Expense Claim",
      employee: data.employee,
      company: data.company,
      posting_date: data.posting_date,
      expenses: data.expenses, // Child table
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
