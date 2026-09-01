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
