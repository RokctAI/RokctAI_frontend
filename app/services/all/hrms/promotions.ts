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
