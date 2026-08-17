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

export class TaskService {
  static async getList(options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Task",
        fields: [
          "name",
          "subject",
          "status",
          "priority",
          "project",
          "exp_end_date",
        ],
        limit_page_length: 50,
        order_by: "creation desc",
      },
      options,
    );
    return response?.message || [];
  }

  static async create(data: any, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.insert",
      {
        doc: { doctype: "Task", ...data },
      },
      options,
    );
    return response?.message;
  }

  static async getUsers(options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "User",
        filters: {
          enabled: 1,
          user_type: "System User",
        },
        fields: ["name", "full_name", "user_image", "email"],
        limit_page_length: 50,
      },
      options,
    );
    return response?.message || [];
  }
}
