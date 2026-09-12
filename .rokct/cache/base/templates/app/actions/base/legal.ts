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

// The legal documents a shell publishes, read as a guest (base_sdk 1.37.0).
//
// Server-side on purpose, like app/actions/base/status.ts: the list
// renders for anonymous visitors (a footer's Legal row, corporate_sdk's
// /legal index), so the doctype and the fields are fixed here rather than
// handed in from the browser. The pages themselves are corporate_sdk's;
// this is the read every shell shares.
//
// Since 1.45.0 the list falls back to the shell's own `data/legal/<slug>.md`
// (lib/site-data kind "legal", bundled at build time by
// lib/site-data/generate.mjs; docs/site-data.md) when the backend answers
// nothing - no base URL, a refused guest read, a failed call, or a backend
// that has published no document yet - and the shell bundles the folder
// (`hasSiteData("legal")`, false in backend mode). The backend wins whenever
// it answers a row; the bundled documents are never merged into its list.
// Like app/actions/base/network-sites.ts, the read goes through the
// generated module, never the disk at request time.

import { platformCall } from "@/app/services/base/platform-gateway";
import {
  LEGAL_DOCTYPE,
  normalisePublicTerms,
  type PublicTerm,
} from "@/components/custom/landing/legal-links";
import { hasSiteData, readSiteData } from "@/lib/site-data/read-site-data";

/**
 * The bundled `data/legal/` pages as public terms, in slug order - the
 * slug is the `/legal/<name>` route id and the title comes from the file,
 * the same `{name, title, disabled: false}` a gateway row becomes. Empty
 * in backend mode, when the shell committed no such folder, or when the
 * bundle cannot be read: the fallback never throws for a guest.
 */
function bundledPublicTerms(): PublicTerm[] {
  try {
    if (!hasSiteData("legal")) return [];
    const docs = readSiteData("legal") ?? {};
    return normalisePublicTerms(
      Object.keys(docs)
        .sort()
        .map((slug) => ({ name: slug, title: docs[slug].title, disabled: 0 })),
    );
  } catch (e) {
    console.error("[legal] bundled data/legal read failed:", e);
    return [];
  }
}

/**
 * Every ENABLED "Terms and Conditions" document, `{name, title,
 * disabled}` each, through the platform gateway as a guest (no
 * credentials) - the same soft-failing shape as `getLandingPlans`: when
 * the gateway has no base URL (a shell with no backend), when the backend
 * refuses the guest read, when the call fails, or when the backend has
 * published nothing, the answer is the shell's bundled `data/legal/`
 * pages (since 1.45.0), and with none of those an empty list. A footer or
 * an index page then lists nothing rather than the page failing.
 */
export async function listPublicTerms(): Promise<PublicTerm[]> {
  try {
    const rows = await platformCall<unknown>(
      "frappe.client.get_list",
      {
        doctype: LEGAL_DOCTYPE,
        fields: ["name", "title", "disabled"],
        filters: { disabled: 0 },
        order_by: "title asc",
        limit_page_length: 100,
      },
      { requireAuth: false },
    );
    const published = normalisePublicTerms(rows);
    if (published.length > 0) return published;
    return bundledPublicTerms();
  } catch (e) {
    console.error("[legal] terms list failed:", e);
    return bundledPublicTerms();
  }
}
