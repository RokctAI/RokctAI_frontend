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

export interface AccountData {
  name: string;
  account_name: string;
  parent_account?: string;
  report_type?: "Balance Sheet" | "Profit and Loss";
  root_type?: "Asset" | "Liability" | "Equity" | "Income" | "Expense";
  account_currency: string;
  balance?: number;
}

export class FinancialReportService {
  static async getAccountBalances(company: string) {
    const response = await BaseService.getList("Account", {
      filters: {
        company: company,
        is_group: 0,
      },
      fields: [
        "name",
        "account_name",
        "parent_account",
        "report_type",
        "root_type",
        "account_currency",
        "balance",
      ],
      limit_page_length: 500,
    });
    return response;
  }

  static async runFinancialReport(reportName: string, filters: any) {
    const response = await BaseService.call("frappe.desk.query_report.run", {
      report_name: reportName,
      filters: filters,
    });
    return response?.message;
  }
}
