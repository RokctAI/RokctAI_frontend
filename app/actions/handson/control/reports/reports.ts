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

import { ReportService } from "@/app/services/control/reports";
import type { ReportDefinition } from "@/app/services/control/reports";
import { revalidatePath } from "next/cache";

/**
 * Fetches all Global Report Definitions.
 * Stored in "SaaS Configuration Item" with category="Report Definition".
 */
export async function getGlobalReports(): Promise<ReportDefinition[]> {
  return ReportService.getGlobalReports();
}

/**
 * Save a Global Report Definition.
 */
export async function saveGlobalReport(report: ReportDefinition) {
  await ReportService.saveGlobalReport(report);
  revalidatePath("/handson/control/reports");
  return { success: true };
}

export async function deleteGlobalReport(name: string) {
  await ReportService.deleteGlobalReport(name);
  revalidatePath("/handson/control/reports");
  return { success: true };
}

/**
 * Seeds some example reports.
 */
export async function seedReports() {
  const examples: ReportDefinition[] = [
    {
      title: "Monthly Sales Revenue",
      category: "Sales",
      sql: "SELECT DATE_FORMAT(transaction_date, '%Y-%m') as date, SUM(grand_total) as total FROM `tabSales Invoice` WHERE docstatus=1 GROUP BY date ORDER BY date DESC LIMIT 12",
      chart_type: "bar",
      x_axis_field: "date",
      y_axis_field: "total",
      is_active: true,
      description: "Revenue trend over the last 12 months.",
    },
    {
      title: "Top Customers by Volume",
      category: "Sales",
      sql: "SELECT customer_name as customer, SUM(grand_total) as volume FROM `tabSales Invoice` WHERE docstatus=1 GROUP BY customer_name ORDER BY volume DESC LIMIT 5",
      chart_type: "pie",
      x_axis_field: "customer",
      y_axis_field: "volume",
      is_active: true,
      description: "Who are our top 5 customers?",
    },
  ];

  for (const ex of examples) {
    await saveGlobalReport(ex);
  }
}
