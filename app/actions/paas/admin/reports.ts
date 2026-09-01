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

"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function getReportData(reportType: string, filters: any = {}) {
  try {
    return await paasCall("api.admin_reports.get_admin_report", {
      doctype: reportType, // Mapping reportType to DocType or specific report logic
      filters: filters,
    });
  } catch (error) {
    console.error(`Failed to fetch ${reportType} report:`, error);
    return [];
  }
}

export async function getRevenueReport(dateRange: {
  from: string;
  to: string;
}) {
  try {
    return await paasCall("api.admin_reports.get_multi_company_sales_report", {
      from_date: dateRange.from,
      to_date: dateRange.to,
    });
  } catch (error) {
    console.error("Failed to fetch revenue report:", error);
    return [];
  }
}
