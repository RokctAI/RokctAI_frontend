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
