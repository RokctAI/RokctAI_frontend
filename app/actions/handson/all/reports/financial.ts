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

import {
  FinancialReportService,
  AccountData,
} from "@/app/services/all/reports/financial";
import { auth } from "@/app/(auth)/auth";

export async function getAccountBalances(company: string) {
  const response = await FinancialReportService.getAccountBalances(company);
  return response || [];
}

export async function runFinancialReport(reportName: string, filters: any) {
  const session = await auth();
  const company = session?.user?.company?.name;

  if (!company) {
    throw new Error("No company context found in session");
  }

  // Force company filter
  const secureFilters = { ...filters, company: company };

  const response = await FinancialReportService.runFinancialReport(
    reportName,
    secureFilters,
  );
  return response; // { result: [...], columns: [...] }
}
