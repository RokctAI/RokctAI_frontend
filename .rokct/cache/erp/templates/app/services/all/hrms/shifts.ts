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
