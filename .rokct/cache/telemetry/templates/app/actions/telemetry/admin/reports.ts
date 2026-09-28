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

import { paasCall } from "@/app/services/base/platform-gateway";

export async function getReportData(
  reportType: string,
  filters: any = {},
  fields: string[] = ["*"],
) {
  try {
    if (reportType === "Overview") {
      // "Overview" is not a doctype: it is the admin dashboard's card set,
      // flattened into {metric, value} rows for the generic report table.
      const stats: any = await paasCall(
        "api.admin_reports.get_admin_statistics",
      );
      const cards = stats?.cards ?? {};
      return Object.entries(cards).map(([key, value]) => ({
        metric: key
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        value,
      }));
    }
    // get_admin_report requires `fields` (a JSON list of columns).
    const rows = await paasCall("api.admin_reports.get_admin_report", {
      doctype: reportType,
      fields: JSON.stringify(fields),
      filters: JSON.stringify(filters ?? {}),
    });
    return Array.isArray(rows) ? rows : [];
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
