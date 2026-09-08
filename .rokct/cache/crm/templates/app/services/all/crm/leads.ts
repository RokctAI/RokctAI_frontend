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

export class LeadService {
  static async getList(page = 1, limit = 20, options?: ServiceOptions) {
    const start = (page - 1) * limit;
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Lead",
        fields: [
          "name",
          "lead_name",
          "first_name",
          "last_name",
          "email_id",
          "mobile_no",
          "status",
          "company_name",
          "lead_owner",
          "modified",
          "creation",
        ],
        limit_start: start,
        limit_page_length: limit,
        order_by: "creation desc",
      },
      options,
    );

    const countRes = await BaseService.call(
      "frappe.client.get_value",
      {
        doctype: "Lead",
        filters: {},
        fieldname: "count(name) as total",
      },
      options,
    );

    return {
      data: response?.message || [],
      total: countRes?.message?.total || 0,
      page,
      limit,
    };
  }

  static async get(name: string, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.get",
      {
        doctype: "Lead",
        name: name,
      },
      options,
    );
    return response?.message;
  }

  static async create(data: any, options?: ServiceOptions) {
    const payload = {
      doctype: "Lead",
      ...data,
      first_name: data.first_name || data.lead_name,
    };
    const response = await BaseService.call(
      "frappe.client.insert",
      { doc: payload },
      options,
    );
    return response?.message;
  }

  static async update(name: string, data: any, options?: ServiceOptions) {
    const response = await BaseService.call(
      "frappe.client.set_value",
      {
        doctype: "Lead",
        name: name,
        fieldname: data,
      },
      options,
    );
    return response?.message;
  }

  static async delete(name: string, options?: ServiceOptions) {
    await BaseService.call(
      "frappe.client.delete",
      {
        doctype: "Lead",
        name: name,
      },
      options,
    );
  }
}
