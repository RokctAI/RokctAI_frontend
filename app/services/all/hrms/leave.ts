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

export interface LeaveApplicationData {
  employee: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason?: string;
  half_day?: boolean;
  company: string;
}

export class LeaveService {
  static async getLeaveTypes(options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Leave Type",
        fields: [
          "name",
          "leave_type_name",
          "max_leaves_allowed",
          "is_carry_forward",
          "is_lwp",
        ],
        limit_page_length: 100,
      },
      options,
    );
    return response?.message || [];
  }

  static async getLeaveAllocations(employee: string, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Leave Allocation",
        filters: { employee: employee, total_leaves_allocated: [">", 0] },
        fields: [
          "name",
          "leave_type",
          "total_leaves_allocated",
          "unused_leaves",
          "to_date",
        ],
        limit_page_length: 100,
      },
      options,
    );
    return response?.message || [];
  }

  static async getHolidays(year?: string, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Holiday",
        fields: ["name", "holiday_date", "description", "weekly_off"],
        filters: {
          holiday_date: [">=", `${year || new Date().getFullYear()}-01-01`],
          parenttype: "Holiday List",
        },
        limit_page_length: 365,
      },
      options,
    );
    return response?.message || [];
  }

  static async getLeaveApplications(
    filters: any = {},
    options?: ServiceOptions,
  ) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Leave Application",
        filters: filters,
        fields: [
          "name",
          "employee",
          "employee_name",
          "leave_type",
          "from_date",
          "to_date",
          "status",
          "total_leave_days",
          "half_day",
          "description",
        ],
        limit_page_length: 50,
        order_by: "creation desc",
      },
      options,
    );
    return response?.message || [];
  }

  static async createLeaveApplication(
    data: LeaveApplicationData & { reason?: string },
    options?: ServiceOptions,
  ) {
    const payload = {
      doctype: "Leave Application",
      employee: data.employee,
      leave_type: data.leave_type,
      from_date: data.from_date,
      to_date: data.to_date,
      half_day: data.half_day ? 1 : 0,
      description: data.reason,
      follow_via_email: 1,
      status: "Open",
      posting_date: new Date().toISOString().split("T")[0],
      company: data.company,
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
