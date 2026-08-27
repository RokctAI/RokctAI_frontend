/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

export class DashboardService {
  /**
   * Aggregates pending approvals from Leave Applications and Expense Claims.
   */
  static async getPendingApprovals(options?: ServiceOptions) {
    // Fetch Leave Applications
    const leaves = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Leave Application",
        filters: { status: "Open" },
        fields: ["name", "employee_name", "leave_type", "status", "from_date"],
        limit_page_length: 5,
      },
      options,
    );

    // Fetch Expense Claims
    const expenses = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Expense Claim",
        filters: { approval_status: "Draft" },
        fields: [
          "name",
          "employee_name",
          "posting_date",
          "total_claimed_amount",
          "approval_status",
        ],
        limit_page_length: 5,
      },
      options,
    );

    const leaveItems = (leaves?.message || []).map((l: any) => ({
      id: l.name,
      title: "Leave Application",
      subtitle: `${l.employee_name} - ${l.leave_type}`,
      status: l.status,
      date: l.from_date,
    }));

    const expenseItems = (expenses?.message || []).map((e: any) => ({
      id: e.name,
      title: "Expense Claim",
      subtitle: `${e.employee_name} - $${e.total_claimed_amount}`,
      status: e.approval_status,
      date: e.posting_date,
    }));

    return [...leaveItems, ...expenseItems];
  }
}
