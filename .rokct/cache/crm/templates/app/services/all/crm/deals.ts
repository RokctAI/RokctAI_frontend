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

export class OpportunityService {
  static async getList(page = 1, limit = 20, options?: ServiceOptions) {
    const start = (page - 1) * limit;
    const response = await BaseService.call(
      "frappe.client.get_list",
      {
        doctype: "Opportunity",
        fields: [
          "name",
          "title",
          "organization",
          "opportunity_owner",
          "status",
          "currency",
          "annual_revenue",
          "probability",
          "modified",
          "creation",
        ],
        limit_start: start,
        limit_page_length: limit,
        order_by: "creation desc",
      },
      options,
    );

    // Helper for counting
    const countRes = await BaseService.call(
      "frappe.client.get_value",
      {
        doctype: "Opportunity",
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
        doctype: "Opportunity",
        name: name,
      },
      options,
    );

    const deal = response?.message;
    if (deal && deal.opportunity_owner) {
      const ownerRes = await BaseService.call(
        "frappe.client.get_value",
        {
          doctype: "User",
          filters: { name: deal.opportunity_owner },
          fieldname: ["user_image", "full_name"],
        },
        options,
      );
      if (ownerRes?.message) {
        deal.opportunity_owner_image = ownerRes.message.user_image;
        deal.opportunity_owner_name = ownerRes.message.full_name;
      }
    }
    return deal;
  }

  static async create(data: any, options?: ServiceOptions) {
    // Data mapping logic should ideally be here if it's purely business logic,
    // but if it's just 'party_name' -> 'title', it's fine.
    // We'll accept cleaner data or partial.
    const doc = {
      doctype: "Opportunity",
      title: data.party_name ? `${data.party_name} Deal` : "New Deal",
      organization:
        data.opportunity_from === "Customer" ? data.party_name : undefined,
      status: data.status,
      ...data, // allow generic override
    };
    // Cleanup computed fields from spreading data if needed, but for now simple merging.
    // Actually, the action did specific mapping. Service should probably take specific args or generic doc.
    // I'll stick to generic doc creation mostly, but keeping the specific logic in service is better for reuse.

    const response = await BaseService.call(
      "frappe.client.insert",
      { doc: doc },
      options,
    );
    return response?.message;
  }

  static async update(name: string, data: any, options?: ServiceOptions) {
    const doc: any = {};
    if (data.party_name) doc.title = `${data.party_name} Deal`;
    if (data.status) doc.status = data.status;
    // Merge other data
    Object.assign(doc, data);

    const response = await BaseService.call(
      "frappe.client.set_value",
      {
        doctype: "Opportunity",
        name: name,
        fieldname: doc,
      },
      options,
    );
    return response?.message;
  }

  static async delete(name: string, options?: ServiceOptions) {
    await BaseService.call(
      "frappe.client.delete",
      {
        doctype: "Opportunity",
        name: name,
      },
      options,
    );
  }
}
