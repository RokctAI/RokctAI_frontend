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


// Where a local-data site's page comes from (corporate_sdk 1.4.0): the
// shell's data/ folder, bundled at build time by base_sdk's
// lib/site-data/generate.mjs into lib/site-data/generated.ts, read with
// base's own rule (kinds.ts resolveSiteData: backend answers nothing,
// hybrid the file when there is one, local the file or an Error naming it).
//
// This module reads the bundle directly instead of through
// read-site-data.ts on purpose: the landing registries (header-menu,
// site-metadata, hero-copy) are module-level objects some client modules
// import for their types, and read-site-data.ts is `server-only`. Nothing
// here is secret: every word of a local-data site is printed on its page.
//
// The seam for many sites from one deployment (backend / hybrid mode, the
// site picked by the request's host) is NOT here yet: see
// corporate/nextjs/docs/local-sites.md, "Many sites, one deployment".

import { SITE_DATA } from "@/lib/site-data/generated";
import {
  hasSiteDataIn,
  resolveSiteData,
  type SiteDataKind,
  type SiteDataKinds,
  type SiteIdentity,
  type SiteSection,
} from "@/lib/site-data/kinds";

/** The kind's data, or undefined when the shell has none (or reads no data/). */
export function siteKind<K extends SiteDataKind>(kind: K): SiteDataKinds[K] | undefined {
  if (!hasSiteDataIn(SITE_DATA, kind)) return undefined;
  return resolveSiteData(SITE_DATA, kind);
}

/** Whether this shell's page is data: a data/sections.json and a data/site.json were bundled. */
export function isDataSite(): boolean {
  return siteKind("sections") !== undefined && siteKind("site") !== undefined;
}

/** The page's sections, top to bottom; [] when the page is not data. */
export function siteSections(): SiteSection[] {
  return siteKind("sections")?.sections ?? [];
}

/** The hero, when the page opens with one. */
export function siteHero() {
  const first = siteSections()[0];
  return first?.type === "hero" ? first : undefined;
}

/** Every section after the hero: what the landing's slots draw, in order. */
export function siteBodySections(): SiteSection[] {
  return siteSections().filter((s) => s.type !== "hero");
}

/** The sections a visitor can jump to: those with an id and a nav label. */
export function siteNav(): { id: string; label: string }[] {
  return siteSections()
    .filter((s): s is SiteSection & { id: string; nav: string } => Boolean(s.id && s.nav))
    .map((s) => ({ id: s.id, label: s.nav }));
}

/** wa.me link to the site's WhatsApp number, with an optional typed message. */
export function whatsappHref(site: SiteIdentity | undefined, text?: string): string {
  const digits = (site?.whatsapp?.number ?? "").replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** A data link's real href: "whatsapp" becomes the chat link, the rest is as written. */
export function resolveHref(href: string, site: SiteIdentity | undefined): string {
  return href === "whatsapp" ? whatsappHref(site) : href;
}

/** Whether a data link leaves the site (opened in a new tab). */
export function isExternalHref(href: string): boolean {
  return href === "whatsapp" || /^https?:\/\//.test(href);
}
