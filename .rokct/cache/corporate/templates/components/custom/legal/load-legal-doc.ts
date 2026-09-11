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

// Where the legal pages get their documents (corporate_sdk 1.0.0): ONE
// small function per page, so the lookup can grow without touching the
// pages. Ray, 2026-09-10: corporate_sdk owns the company pages as
// renderers, with content from the shell's data/ folder on local / hybrid
// shells. In 1.0.0 both read the shell's backend as a guest through
// base_sdk's gateway and nothing else; since 1.1.0 they fall back to the
// shell's `data/legal/<slug>.md` (base_sdk 1.35.0's `legal` kind, read
// through `@/lib/site-data/read-site-data`) when the folder carries the
// documents AND the shell is `local` (no backend, ever) or has no backend
// to ask (no tenant base URL resolves for this request). A `hybrid`
// shell with a backend keeps reading the backend, as 1.0.0 did.
//
// Server-only by use (the actions and the reader it calls are),
// directive-free itself.

import { listPublicTerms } from "@/app/actions/base/legal";
import { getPublicTerm } from "@/app/actions/corporate/legal";
import { resolveTenantBaseUrl } from "@/app/services/base/platform-gateway";
import type { PublicTerm } from "@/components/custom/landing/legal-links";
import type { LegalDoc } from "@/components/custom/legal/legal-doc";
import type { SiteLegal } from "@/lib/site-data/kinds";
import { hasSiteData, readSiteData, siteDataMode } from "@/lib/site-data/read-site-data";

/**
 * The shell's `data/legal/` documents when they are what the pages read
 * (1.1.0): the folder carries them (`hasSiteData("legal")`, false in
 * backend mode) and the shell is `local` or no backend resolves.
 * Otherwise `null`, and the backend is asked as before. Never throws:
 * `hasSiteData` is asked first, so a local shell without the folder gets
 * the backend answer (nothing) rather than the reader's Error.
 */
export async function siteLegalDocs(): Promise<SiteLegal | null> {
  if (!hasSiteData("legal")) return null;
  if (siteDataMode() !== "local") {
    let backend: string | undefined;
    try {
      backend = await resolveTenantBaseUrl();
    } catch (e) {
      console.error("[legal] tenant resolution failed:", e);
      backend = undefined;
    }
    if (backend) return null;
  }
  return readSiteData("legal") ?? null;
}

/** One `data/legal/<slug>.md` page as a [LegalDoc]: the slug is the route id and the title comes from the file. */
export function legalDocFromSiteData(slug: string, docs: SiteLegal): LegalDoc | null {
  const page = docs[slug];
  if (!page) return null;
  return { name: slug, title: page.title, body: page.markdown, disabled: false };
}

/**
 * The document at `/legal/<slug>`, or `null` when the page should answer
 * 404: no such document, a disabled one, or no backend to ask. The page
 * never needs to know which.
 */
export async function loadLegalDoc(slug: string): Promise<LegalDoc | null> {
  const local = await siteLegalDocs();
  if (local) return legalDocFromSiteData(slug, local);
  const doc = await getPublicTerm(slug);
  if (!doc || doc.disabled) return null;
  return doc;
}

/**
 * The documents `/legal` lists - every enabled one, `{name, title}` each -
 * and the same list a footer's Legal row is built from. Empty with no
 * backend or nothing published; the folder's pages, in slug order, when
 * the folder is what the pages read.
 */
export async function loadLegalIndex(): Promise<PublicTerm[]> {
  const local = await siteLegalDocs();
  if (local) {
    return Object.keys(local)
      .sort()
      .map((slug) => ({ name: slug, title: local[slug].title, disabled: false }));
  }
  return listPublicTerms();
}
