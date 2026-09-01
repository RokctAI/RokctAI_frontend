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

export interface ReportConfig {
  name: string;
  title: string;
  ref_doctype: string;
}

export const LENDING_REPORTS: ReportConfig[] = [
  {
    name: "Loan Security Status",
    title: "Loan Security Status",
    ref_doctype: "Loan Security Pledge",
  },
  {
    name: "Loan Security Exposure",
    title: "Loan Security Exposure",
    ref_doctype: "Loan Security Pledge",
  },
  {
    name: "Loan Repayment and Closure",
    title: "Loan Repayment & Closure",
    ref_doctype: "Loan Repayment",
  },
  {
    name: "Loan Interest Report",
    title: "Loan Interest Report",
    ref_doctype: "Loan Interest Accrual",
  },
  {
    name: "Applicant-wise Loan Security Exposure",
    title: "Applicant Security Exposure",
    ref_doctype: "Loan Security Pledge",
  },
];
