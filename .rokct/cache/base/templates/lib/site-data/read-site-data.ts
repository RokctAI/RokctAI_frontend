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

// The reader of the shell's host-owned data/ folder (base_sdk 1.35.0).
// Server-only: the bundle it reads (./generated.ts, written at build time
// by ./generate.mjs) carries every file's content, and a client bundle has
// no business shipping the whole folder. A server component, a server
// action or a route handler in ANY composed SDK imports it as
//
//     import { readSiteData, hasSiteData, siteDataMode } from "@/lib/site-data/read-site-data";
//     import type { SiteTeam, SiteLegal } from "@/lib/site-data/kinds";
//
// (the types live in ./kinds.ts, importable from client code too). The
// rule is ./kinds.ts's resolveSiteData: `backend` answers undefined for
// everything, `hybrid` the file when there is one, `local` the file or an
// Error naming the missing one - a local shell has no backend to fall back
// to, so the page fails loudly instead of rendering nothing. A local build
// already fails at generate time for every kind an installed SDK's manifest
// declares it requires, so the throw here is the safety net for a kind
// nobody declared.

import "server-only";

import { SITE_DATA } from "./generated";
import {
  hasSiteDataIn,
  resolveSiteData,
  type SiteDataBundle,
  type SiteDataKind,
  type SiteDataKinds,
  type SiteDataMode,
} from "./kinds";

/** The mode the shell declared in composer.json `"data"` (backend when it declared none). */
export function siteDataMode(): SiteDataMode {
  return SITE_DATA.mode;
}

/** The whole bundle, for a caller that needs more than one kind at once. */
export function siteDataBundle(): SiteDataBundle {
  return SITE_DATA;
}

/**
 * Whether `readSiteData(kind)` answers a value: false in backend mode and
 * for a kind with no file - never a throw, so a renderer in hybrid mode
 * decides between data/ and its backend with one `if`.
 */
export function hasSiteData(kind: SiteDataKind): boolean {
  return hasSiteDataIn(SITE_DATA, kind);
}

/**
 * The kind's file as bundled at build time, typed by kind - `theme`,
 * `team`, `stockists`, `products`, `network` parsed JSON, `about` the
 * markdown string, `legal` the slug-to-page map. undefined in backend mode and, in hybrid
 * mode, when the file is absent; an Error in local mode when it is.
 */
export function readSiteData<K extends SiteDataKind>(kind: K): SiteDataKinds[K] | undefined {
  return resolveSiteData(SITE_DATA, kind);
}
