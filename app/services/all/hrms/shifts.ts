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

export interface ShiftAssignmentData {
  employee: string;
  shift_type: string;
  start_date: string;
  end_date?: string;
  company: string;
}

export class ShiftService {
  static async getShiftTypes(options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Shift Type",
        fields: ["name", "start_time", "end_time", "color"],
        limit_page_length: 50,
      },
      options,
    );
    return response?.message || [];
  }

  static async getShiftAssignments(options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Shift Assignment",
        fields: [
          "name",
          "employee",
          "employee_name",
          "shift_type",
          "start_date",
          "end_date",
          "status",
        ],
        filters: { status: "Active" },
        limit_page_length: 100,
        order_by: "start_date desc",
      },
      options,
    );
    return response?.message || [];
  }

  static async createAssignment(
    data: ShiftAssignmentData,
    options?: ServiceOptions,
  ) {
    const payload = {
      doctype: "Shift Assignment",
      employee: data.employee,
      shift_type: data.shift_type,
      start_date: data.start_date,
      end_date: data.end_date,
      company: data.company,
      status: "Active",
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
