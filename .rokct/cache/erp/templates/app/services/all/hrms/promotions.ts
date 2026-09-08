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

export interface PromotionData {
  employee: string;
  promotion_date: string;
  current_department?: string;
  current_designation?: string;
  new_department: string;
  new_designation: string;
}

export class PromotionService {
  static async getList(options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Employee Promotion",
        fields: [
          "name",
          "employee",
          "employee_name",
          "promotion_date",
          "current_designation",
          "new_designation",
        ],
        limit_page_length: 50,
        order_by: "promotion_date desc",
      },
      options,
    );
    return response?.message || [];
  }

  static async create(data: PromotionData, options?: ServiceOptions) {
    const promotion_details = [];

    if (
      data.new_designation &&
      data.new_designation !== data.current_designation
    ) {
      promotion_details.push({
        property: "Designation",
        fieldname: "designation",
        current: data.current_designation,
        new: data.new_designation,
      });
    }

    if (
      data.new_department &&
      data.new_department !== data.current_department
    ) {
      promotion_details.push({
        property: "Department",
        fieldname: "department",
        current: data.current_department,
        new: data.new_department,
      });
    }

    const payload = {
      doctype: "Employee Promotion",
      employee: data.employee,
      promotion_date:
        data.promotion_date || new Date().toISOString().split("T")[0],
      promotion_details: promotion_details,
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
