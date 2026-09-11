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

// The shell's own network sites, read from its data/ folder (base_sdk
// 1.40.0). Base carries no site of the network - a site's name is brand
// content and its logo a hostname - so the strip
// (components/custom/network-strip.tsx) draws the sites the home SDK
// registers on its NetworkStripConfig and, when it registers none, the
// ones the shell commits in `data/network.json` (lib/site-data kind
// "network"; docs/site-data.md).
//
// Server-side on purpose, like app/actions/base/legal.ts: the bundled data
// module (lib/site-data/generated.ts) carries every data/ file and is
// server-only, and the strip is client chrome. The action answers the file
// only; it never adds a link, a parameter or a site of its own.

import type { SiteNetwork } from "@/lib/site-data/kinds";
import { hasSiteData, readSiteData } from "@/lib/site-data/read-site-data";

/** The empty answer: no site, the strip's default heading. */
const NO_SITES: SiteNetwork = { sites: [] };

/**
 * `data/network.json` as bundled at build time, or `{ sites: [] }`: in
 * backend mode always (no file is ever read), and in local or hybrid mode
 * when the shell committed no such file - the strip is optional chrome, so
 * a local shell without it shows no strip rather than failing the page.
 * The answer is a fresh copy each time; the bundle is never handed out.
 */
export async function getNetworkSites(): Promise<SiteNetwork> {
  try {
    if (!hasSiteData("network")) return { sites: [] };
    const own = readSiteData("network") ?? NO_SITES;
    return { ...(own.heading ? { heading: own.heading } : {}), sites: own.sites.map((site) => ({ ...site })) };
  } catch (e) {
    console.error("[network] data/network.json read failed:", e);
    return { sites: [] };
  }
}
