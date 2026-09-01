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

import { BaseService } from "@/app/services/common/base";

export interface StandardReportDef {
  name: string;
  title: string;
  description: string;
  doctype: string;
  category: "Financial" | "Sales" | "Stock" | "Project";
  defaultColumns: string[];
}

export class AnalyticsService {
  static async runCustomReport(
    doctype: string,
    fields: string[],
    filters: any = {},
  ) {
    const response = await BaseService.getList(doctype, {
      fields: fields,
      filters: filters,
      limit_page_length: 500,
      order_by: "creation desc",
    });
    return response;
  }

  static async executeReportQuery(sql: string) {
    // Basic Security Sanity Check
    const upperSql = sql.toUpperCase();
    if (
      upperSql.includes("DROP ") ||
      upperSql.includes("DELETE ") ||
      upperSql.includes("UPDATE ") ||
      upperSql.includes("INSERT ") ||
      upperSql.includes("ALTER ") ||
      upperSql.includes("TRUNCATE ") ||
      upperSql.includes("GRANT ")
    ) {
      throw new Error("Security Error: Only SELECT queries are allowed.");
    }

    const response = await BaseService.call("frappe.client.get_sql", {
      query: sql,
      as_dict: 1,
    });
    return response?.message;
  }
}
