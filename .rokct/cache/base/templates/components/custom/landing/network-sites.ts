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

// The ONE list of the sites in the Rokct network, and the pure rules the
// network strip (components/custom/network-strip.tsx) applies to it.
//
// Ray, 2026-09-09: each product has its own shell now - rokct.ai lists none
// of the others as a plan to buy - but a founder who lands on rokct.ai's
// free opportunities pages must still learn about the other products, from
// a clickable strip of their logos under a "Trusted by" heading ("these
// products already trust rokct as they run on it"). The list lives in base
// because every shell shows the SAME strip minus itself: a product that
// joins the network is added here once and every composed shell picks it
// up on its next compose. No home SDK restates it.
//
// This module is pure and browser-safe: it imports only the kernel's host
// normalisation (app/services/base/tenant-hosts.ts, itself import-free), so
// the client bundle that draws the strip can use the same
// `normaliseHost` app/lib/site-metadata.ts's resolveDisplayHost uses.
//
// No entry carries, and no rule adds, a query string: a link in the strip
// is the site's own origin, never a tracking parameter, never an ad
// network's redirect. tests/network-strip.test.mts holds that line.

import { normaliseHost } from "@/app/services/base/tenant-hosts";

/**
 * One site in the network.
 *
 * - `key` is stable and unique; the home SDK's registry names it to hide
 *   or reorder the entry.
 * - `name` is the wordmark drawn when there is no logo, and the alt text
 *   when there is.
 * - `url` is the site's origin, or `null` for a product that has no
 *   domain yet (Ray, 2026-09-09: "hosting will get a name when i decide on
 *   domain") - such an entry is also `shown: false`, and stays in the list
 *   as the place its domain goes.
 * - `logo` is an absolute URL, or a public path on the site that draws
 *   the strip, to the mark drawn instead of the name; `logoDark` its
 *   dark-theme twin when the site has one.
 * - `wordmark` says the site's name IS its logo (Supacharge until Ray
 *   designs an icon): the name is drawn as text even when a logo path is
 *   later added elsewhere.
 * - `shown` defaults to true; false keeps the entry off every strip.
 */
export interface NetworkSite {
  key: string;
  name: string;
  url: string | null;
  logo?: string;
  logoDark?: string;
  wordmark?: boolean;
  shown?: boolean;
}

/**
 * The network, in the default strip order. Logos are read from each site's
 * own public assets, so a mark changes in one place - on its own site.
 *
 * The rokct.ai and juvo shells serve two glyphs and name them after the
 * TILE their brand-logo.tsx draws them on, not the page: `logo.svg` is the
 * WHITE glyph (on a dark tile in light mode) and `logo_dark.svg` the BLACK
 * one (on a light tile in dark mode). The strip draws the bare glyph on
 * the page itself, so the black one is the light-theme `logo` and the
 * white one the dark-theme `logoDark`.
 */
export const NETWORK_SITES: readonly NetworkSite[] = [
  {
    key: "rokct",
    name: "rokct.ai",
    url: "https://rokct.ai",
    logo: "https://rokct.ai/images/logo_dark.svg",
    logoDark: "https://rokct.ai/images/logo.svg",
  },
  {
    key: "supacharge",
    name: "Supacharge",
    url: "https://supacharge.app",
    wordmark: true,
  },
  {
    key: "juvo",
    name: "juvo",
    url: "https://juvo.app",
    logo: "https://juvo.app/images/logo_dark.svg",
    logoDark: "https://juvo.app/images/logo.svg",
  },
  // No domain yet (Ray, 2026-09-09): listed so the entry has a place, hidden
  // until the url is filled in.
  { key: "hosting", name: "Hosting", url: null, shown: false },
  { key: "telephony", name: "Telephony", url: null, shown: false },
];

/** A site that can be drawn: shown, with a URL to link to. */
export type LinkableNetworkSite = NetworkSite & { url: string };

/**
 * The host of a site URL, normalised exactly as app/lib/site-metadata.ts's
 * resolveDisplayHost normalises one (port dropped, leading `www.` dropped,
 * lower-cased); null for an empty value or anything that is not a URL.
 */
export function networkSiteHost(url: string | null | undefined): string | null {
  const raw = url?.trim();
  if (!raw) return null;
  try {
    return normaliseHost(new URL(raw).host);
  } catch {
    return null;
  }
}

/** True when the URL carries a query string or a fragment - which no strip link may. */
export function hasTrackingParameters(url: string): boolean {
  return /[?#]/.test(url);
}

/** What the strip is told about which sites to draw and in which order. */
export interface NetworkSiteSelection {
  /**
   * The current shell's own host, normalised (networkSiteHost of
   * NEXT_PUBLIC_SITE_URL, else of the registered site-metadata `url`). The
   * site whose host matches is left out: a shell never lists itself. Null
   * leaves every site in.
   */
  selfHost?: string | null;
  /** Keys drawn first, in this order; the rest follow in list order. */
  order?: readonly string[];
  /** Keys left out on this shell, on top of the list's own `shown: false`. */
  hidden?: readonly string[];
}

/**
 * The sites the strip draws, in order: every `shown` entry with a URL,
 * minus the current shell (matched by host), minus the hidden keys, the
 * named `order` first. Pure; the component and the tests call it alike.
 */
export function resolveNetworkSites(
  sites: readonly NetworkSite[],
  selection: NetworkSiteSelection = {},
): LinkableNetworkSite[] {
  const self = selection.selfHost ? normaliseHost(selection.selfHost) : null;
  const hidden = new Set(selection.hidden ?? []);

  const linkable = sites.filter((site): site is LinkableNetworkSite => {
    if (site.shown === false) return false;
    if (!site.url || hasTrackingParameters(site.url)) return false;
    if (hidden.has(site.key)) return false;
    if (self && networkSiteHost(site.url) === self) return false;
    return true;
  });

  const order = selection.order ?? [];
  if (order.length === 0) return linkable;
  // Array.prototype.sort is stable: the unnamed keep their list order.
  const rank = new Map(order.map((key, index) => [key, index]));
  const rankOf = (site: NetworkSite) => rank.get(site.key) ?? Number.MAX_SAFE_INTEGER;
  return [...linkable].sort((a, b) => rankOf(a) - rankOf(b));
}
