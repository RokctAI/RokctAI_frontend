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

/**
 * Standard Currency Formatter for Lending Module
 * Defaults to South African Rand (ZAR) as per NCR requirements,
 * but can be adjusted to respect Company Settings in future.
 */
export function formatCurrency(
  amount: number | undefined | null,
  currency = "ZAR",
): string {
  if (amount === undefined || amount === null) return "R 0.00";

  // For NCR Compliance, we mostly want "R" but Intl uses "ZAR" -> "R" automatically.
  // We force South Africa locale for the formatting style (e.g. spaces/commas).
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
