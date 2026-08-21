/*
 * Copyright (c) 2026 RokctAI
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
