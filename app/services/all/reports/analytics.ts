/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
