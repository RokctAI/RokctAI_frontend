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

// The legal documents a shell publishes, as the footer links to them
// (base_sdk 1.37.0). Ray, 2026-09-10: "supa has no terms pages or about
// page" - and, on the Dart side, corporate_sdk owns the policy / terms
// pages and every auth composition includes it. The Next.js layout
// mirrors that split:
//
//  - the PAGES (`/legal` and `/legal/<name>`) are corporate_sdk's;
//  - this module and app/actions/base/legal.ts are base's: the guest read
//    of the published documents and the pure rule that turns them into a
//    footer link group, so a home SDK's footer can list every enabled
//    document with one call and never a hard-coded title.
//
// A document is a "Terms and Conditions" doc on the shell's backend (the
// doctype base's admin editor at app/admin/settings/terms writes); its
// `name` is the route id, its `title` the link text. Pure and server-safe:
// no product copy, no hostname, no directive.

import type {
  FooterLink,
  FooterLinkGroup,
} from "@/components/custom/landing/footer-chrome-config";

/** The doctype the documents live in - the one base's admin editor writes. */
export const LEGAL_DOCTYPE = "Terms and Conditions";

/** The route corporate_sdk serves the documents at. */
export const LEGAL_ROUTE = "/legal";

/** The default label of the footer group (a home SDK may pass its own). */
export const DEFAULT_LEGAL_GROUP_LABEL = "Legal";

/** The id of the footer group [legalFooterLinks] builds. */
export const LEGAL_GROUP_ID = "legal";

/** One published document as the footer and the index page list it. */
export interface PublicTerm {
  /** The doc name - the `/legal/<name>` route id. */
  name: string;
  /** The words the link shows. */
  title: string;
  /** Always `false` for a public row; kept so a caller can pass raw rows. */
  disabled: boolean;
}

/** The href of one document's page. */
export function legalDocHref(name: string): string {
  return `${LEGAL_ROUTE}/${encodeURIComponent(name)}`;
}

/**
 * The rows a gateway list answered, as [PublicTerm]s: anything that is
 * not a row with a string `name` and `title` is dropped, a disabled row
 * is dropped, and the `disabled` flag (Frappe's 0/1) is a boolean. `null`
 * (no backend, a failed call) is an empty list - a shell with no backend
 * publishes nothing and shows nothing.
 */
export function normalisePublicTerms(rows: unknown): PublicTerm[] {
  const list = Array.isArray(rows)
    ? rows
    : Array.isArray((rows as { message?: unknown } | null)?.message)
      ? ((rows as { message: unknown[] }).message)
      : [];
  const out: PublicTerm[] = [];
  for (const row of list) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const name = typeof r.name === "string" ? r.name.trim() : "";
    const title = typeof r.title === "string" ? r.title.trim() : "";
    if (!name || !title) continue;
    const disabled = r.disabled === true || Number(r.disabled) === 1;
    if (disabled) continue;
    out.push({ name, title, disabled: false });
  }
  return out;
}

/**
 * The footer group listing the given documents, one link each, in the
 * order given - or NO group when there is nothing to list, so a footer
 * that spreads the result draws nothing new until a document exists.
 * Titles come from the documents, never from here: the only word this
 * module owns is the group's default label, and the caller may replace it.
 */
export function legalFooterLinks(
  terms: readonly PublicTerm[],
  label: string = DEFAULT_LEGAL_GROUP_LABEL,
): FooterLinkGroup[] {
  const items: FooterLink[] = [];
  const seen = new Set<string>();
  for (const term of terms) {
    if (term.disabled || !term.name || !term.title) continue;
    if (seen.has(term.name)) continue;
    seen.add(term.name);
    items.push({
      id: `${LEGAL_GROUP_ID}-${term.name}`,
      label: term.title,
      href: legalDocHref(term.name),
    });
  }
  if (items.length === 0) return [];
  return [{ id: LEGAL_GROUP_ID, label, items }];
}
