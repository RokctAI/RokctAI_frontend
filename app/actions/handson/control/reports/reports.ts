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
