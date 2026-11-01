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

// A local-data site's price words (corporate_sdk 1.5.0): the amount in a
// price string, money written the way the price is ("R1,500", "R6.25"),
// and the templates a tier's `fine` line and `slider` use - `{n}` (the
// quantity), `{units}` (n x pricing.perCase), `{price}`, `{each}` (price /
// perCase) and `{total}` (n x price). Pure and server-safe, so the server
// card and the client slider fill the same words.

/** The first number in a price ("R150" -> 150, "R1,500.50" -> 1500.5), or null. */
export function priceAmount(price: string): number | null {
  const m = price.match(/[0-9][0-9,]*(\.[0-9]+)?/);
  return m ? Number(m[0].replace(/,/g, "")) : null;
}

/** Whatever the price writes before its number ("R" in "R150"). */
export function pricePrefix(price: string): string {
  const i = price.search(/[0-9]/);
  return i > 0 ? price.slice(0, i) : "";
}

/** `amount` as money in the price's own style: thousands with commas, cents only when there are any. */
export function formatMoney(amount: number, prefix: string): string {
  const cents = Math.round(amount * 100);
  const whole = Math.trunc(cents / 100);
  const rest = Math.abs(cents % 100);
  const grouped = String(Math.abs(whole)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${cents < 0 ? "-" : ""}${prefix}${grouped}${rest ? `.${String(rest).padStart(2, "0")}` : ""}`;
}

export interface PriceWords {
  n?: number;
  price: string;
  perCase?: number;
}

/** Fills `{n}`, `{units}`, `{price}`, `{each}` and `{total}` in `template`; a token it cannot fill stays as written. */
export function fillPriceWords(template: string, { n, price, perCase }: PriceWords): string {
  const amount = priceAmount(price);
  const prefix = pricePrefix(price);
  const values: Record<string, string | undefined> = {
    n: n === undefined ? undefined : String(n),
    units: n !== undefined && perCase ? String(n * perCase) : undefined,
    price,
    each: amount !== null && perCase ? formatMoney(amount / perCase, prefix) : undefined,
    total: amount !== null && n !== undefined ? formatMoney(amount * n, prefix) : undefined,
  };
  return template.replace(/\{(n|units|price|each|total)\}/g, (whole, key: string) => values[key] ?? whole);
}
