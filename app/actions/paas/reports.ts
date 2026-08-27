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

import { paasCall } from "@/app/lib/paas-gateway";

export async function getSellerStatistics() {
  try {
    const stats = await paasCall("api.seller_reports.get_seller_statistics");
    return stats;
  } catch (error) {
    console.error("Failed to fetch statistics:", error);
    return null;
  }
}

export async function getOrderReport(fromDate?: string, toDate?: string) {
  // api.seller_reports.get_seller_sales_report requires both dates —
  // default to the last 30 days when the caller omits them.
  const to = toDate ?? new Date().toISOString().slice(0, 10);
  const from =
    fromDate ??
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  try {
    const report = await paasCall(
      "api.seller_reports.get_seller_sales_report",
      {
        from_date: from,
        to_date: to,
      },
    );
    return report;
  } catch (error) {
    console.error("Failed to fetch order report:", error);
    return [];
  }
}
