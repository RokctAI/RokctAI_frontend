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

export class SeparationService {
  static async getList(options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Employee Separation",
        fields: [
          "name",
          "employee",
          "employee_name",
          "resignation_letter_date",
          "status",
          "exit_interview_summary",
        ],
        limit_page_length: 50,
        order_by: "resignation_letter_date desc",
      },
      options,
    );
    return response?.message || [];
  }

  static async create(data: any, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.insert",
      {
        doc: {
          doctype: "Employee Separation",
          ...data,
        },
      },
      options,
    );
    return response?.message;
  }
}
