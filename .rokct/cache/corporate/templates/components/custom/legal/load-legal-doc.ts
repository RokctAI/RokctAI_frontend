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
// Since 1.2.0 the backend's answer is checked the way base_sdk 1.45.0's
// listPublicTerms() checks it: the backend wins whenever it answers an
// ENABLED document, and when it answers nothing for the slug - no such
// document, a disabled one, a refused guest read, a failed call - the
// bundled `data/legal/<slug>.md` page is the document, in ANY data mode
// that bundles the folder (`bundledLegalDoc`). So the slug the 1.45.0
// index lists on a hybrid shell whose backend publishes nothing no longer
// 404s on its own page; a shell with no folder answers exactly what it did.
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
 * The bundled `data/legal/<slug>.md` page as the document (1.2.0), in
 * any data mode that bundles the folder; `null` without the folder, the
 * slug, or on a failed read (logged, never thrown - the page then 404s
 * as it would with nothing). What [loadLegalDoc] falls back to when the
 * backend answers nothing for the slug, mirroring base_sdk 1.45.0's
 * listPublicTerms().
 */
export function bundledLegalDoc(slug: string): LegalDoc | null {
  try {
    if (!hasSiteData("legal")) return null;
    const docs = readSiteData("legal");
    return docs ? legalDocFromSiteData(slug, docs) : null;
  } catch (e) {
    console.error("[legal] bundled data/legal read failed:", e);
    return null;
  }
}

/**
 * The document at `/legal/<slug>`, or `null` when the page should answer
 * 404: no such document anywhere, or a disabled one with no bundled page
 * of that slug. The page never needs to know which. The folder is the
 * document outright when [siteLegalDocs] says so (1.1.0); otherwise the
 * backend is asked and wins with an enabled document, and the bundled
 * page of that slug answers when it has none (1.2.0).
 */
export async function loadLegalDoc(slug: string): Promise<LegalDoc | null> {
  const local = await siteLegalDocs();
  if (local) return legalDocFromSiteData(slug, local);
  const doc = await getPublicTerm(slug);
  if (doc && !doc.disabled) return doc;
  return bundledLegalDoc(slug);
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
