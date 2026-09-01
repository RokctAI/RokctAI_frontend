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
