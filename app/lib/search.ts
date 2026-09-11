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

import { platformCall } from "@/app/services/base/platform-gateway";

export type SearchResult<T = string> =
  | { success: true; value: T }
  | {
      success: false;
      error: string;
      isAmbiguous?: boolean;
      suggestions?: string[];
    };

/**
 * Tries to find a document by exact name. If not found, tries a fuzzy search.
 * @param doctype The Frappe Doctype to search (e.g., "Supplier", "Customer")
 * @param query The name/query string provided by the user
 * @param filters Optional additional filters
 * @returns { success: true, value: name } OR { success: false, error: "Did you mean..." }
 *
 * Both lookups ride the ONE platform gateway (ADR-005, a `{cmd, payload}`
 * POST), never a per-method URL; `frappe.client.*` is the framework form
 * the gateway takes verbatim (app/lib/gateway-rpc.ts).
 *
 * They had to move: `FrappeApp.call()` takes ZERO arguments and returns a
 * `FrappeCall` (frappe-js-sdk 1.12.0, `lib/frappe_app/index.d.ts`), so
 * neither lookup issued an HTTP request — `exact.message` and
 * `fuzzy.message` read `undefined` off an SDK builder, and every caller got
 * "not found" for a document that exists. The compiler was already saying
 * so: both lines were `TS2554: Expected 0 arguments, but got 1` on `main`.
 *
 * `platformCall` unwraps Frappe's single top-level `message` envelope, so
 * the target's own return value arrives directly — hence `exact?.name` and
 * `fuzzy[0].name` rather than the old `.message.` hop. `throwOnError`
 * keeps the axios semantics the catch below was written against.
 */
export async function findFuzzyMatch(
  doctype: string,
  query: string,
  filters: Record<string, any> = {},
): Promise<SearchResult> {
  // 1. Try Exact Match
  try {
    const exact = await platformCall<{ name?: string }>(
      "frappe.client.get_value",
      {
        doctype,
        filters: { name: query, ...filters },
        fieldname: "name",
      },
      { throwOnError: true },
    );

    if (exact?.name) {
      return { success: true, value: exact.name };
    }

    // 2. Try Fuzzy Match (Contains)
    // We use "like" %query%
    const fuzzy = await platformCall<{ name: string }[]>(
      "frappe.client.get_list",
      {
        doctype,
        filters: { name: ["like", `%${query}%`], ...filters },
        fields: ["name"],
        limit_page_length: 3,
      },
      { throwOnError: true },
    );

    if (fuzzy && fuzzy.length > 0) {
      const bestGuess = fuzzy[0].name;
      return {
        success: false,
        error: `${doctype} '${query}' not found. Did you mean '${bestGuess}'?`,
        isAmbiguous: true,
        suggestions: fuzzy.map((m: { name: string }) => m.name),
      };
    }

    return { success: false, error: `${doctype} '${query}' not found.` };
  } catch (e: any) {
    console.error(`Fuzzy search failed for ${doctype}`, e);
    return { success: false, error: e.message || "Search failed" };
  }
}
