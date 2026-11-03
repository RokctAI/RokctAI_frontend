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
// rokct.ai's header menu, for base_sdk's header-menu registry
// (components/custom/landing/header-menu.ts, base_sdk >= 1.20.0), which the
// shared header renders inside itself: inline beside the logo from the `lg`
// breakpoint up, behind a burger below it.
//
// Since 1.9.0 (base_sdk 1.18.0) the groups are ONE panel under the first
// group's label, as the old header drew them: Product is the lead group,
// so "Product" is the trigger and its three platform entries carry the
// `icon` and `description` the old panel's left-hand cards had (FiBox /
// FiGlobe / FiSmartphone and header.chrome_support / browser_support /
// mobile_support in the hand-written header); AI Chat, Productivity, Tools
// and Summary are the four headed columns beside them.
//
// Ray, 2026-09-09: rokct.ai and supacharge.app must use ONE header, the same
// component, with the menu inside it. base_sdk 1.14.0 ships that header;
// what it does not know is rokct.ai's WORDS, which until now lived only in
// rokctai_frontend's own components/custom/header.tsx and its
// app/config/features.ts (the PLATFORM_FEATURES registry that header drew
// its mega menu from). This module is those words as a HeaderMenu, entry
// for entry, so the shared header shows on rokct.ai what the hand-written
// one did: the top-level links, the Product dropdown's five columns, and
// the two call-to-action buttons.
//
// `pricing` is an ANCHOR, not a link. copied-pricing.tsx registers
// `{ id: "pricing", label: "Pricing" }` in its meta.nav, so base resolves
// the id against the page's live nav, lifts the label from that entry, and
// drops it on a render where the section is not on the page - which a
// hand-written "#pricing" href could not do. Affiliate and Teams were
// fixed links to routes the page has no section for; since 1.23.0 they are
// not drawn at all, because neither route exists yet (see `links`).
//
// Labels come from the shell's own dictionary through `t` (agent_sdk
// requires app/lib/i18n/index.ts; rokctai_frontend's en.json carries every
// features.* and header.* key used here), read once at module load - `t`
// is a synchronous lookup over a static JSON, and the header-menu contract
// wants already-translated strings. `word` keeps the English beside each
// key so a shell whose dictionary lacks a key shows the word, not the key
// (`t` answers the key itself when it finds nothing).
//
// Badges use the declared "new" | "soon" vocabulary and base renders a
// "soon" entry non-navigable, so the "#" hrefs on unreleased features are
// never followed. The two Chrome Web Store entries are `external` and open
// in a new tab.
//
// Since 1.14.0 (base_sdk 1.24.0) the menu also declares the BRAND the old
// header drew (Ray, 2026-09-09: "header lost functions the old rokct header
// had"; rokct.ai keeps everything its old host header had): the mark with
// its BETA strip (`badge`, the old `<BrandLogo showBadge={true} />`), and
// the COLLAPSING brand - the large wordmark that slid away 1.5s after load
// leaving the mark, the visitor's country code and a chevron, with the nav
// fading until the pointer was over the bar or the page scrolled. The code
// comes from the same place the old header read it: `getBrandingSync()`,
// the shell's client-side branding cache (app/config/platform.ts, an
// agent_sdk `requires` file), whose `code` and `style` the old header
// spread onto its span. "Chat with ROK" is `secondary`, the filled muted
// button the old nav drew it as, not the outlined `ghost`.
//
// Since 1.15.0 (base_sdk 1.25.0) the extension button draws the Chrome
// Web Store MARK the old header drew, from a public file of the shell's
// rather than the third party's CDN the old header hot-linked it from.
// Ray, 2026-09-09: "i dont think merlin owns [the icon] so use it but
// bring it local". Since 1.16.0 (base_sdk 1.26.0) that file is base's:
// base installs public/brand/marks/chrome-web-store.svg on every host and
// this SDK only names the path, which is how a home SDK opts in. The
// hero's Chrome Web Store badge (./agent-hero-copy.ts) names the same path.
//
// Since 1.24.0 (Ray approved the rokct.ai redesign on 2026-11-01) the menu
// is the redesign's: five in-page links - Ask ROK, Platform, How it works,
// Funding, Plans - each an ANCHOR naming one of the redesign's sections
// (rokct-hero, rokct-platform, rokct-how, rokct-funding, rokct-plans), so
// the label comes from that section's meta.nav and a link is dropped on a
// render where its section is not on the page. The Product panel and its
// four columns are gone: they were the Merlin extension's menu (the
// Browser Extension card, YouTube and article summarisers) and most of
// their entries led to "#". The one call to action is "Start with ROKCT",
// to sign-up; the Chrome extension button is gone.
//
// The brand keeps every mechanic Ray asked to keep ("if country code is
// not fixed i cant approve"; "bring menus to header they just fade like in
// current site"): base's collapsing brand, 1500ms after load, with the
// country code from getBrandingSync() in the superscript style the
// branding cache carries, the chevron, and the nav that fades once the
// brand collapses and comes back on hover or scroll - all base_sdk 1.24.0's,
// unchanged. What changes is the MARK: the declaration names
// /landing/agent/rk-mark.svg, the redesign's yellow R tile, which base
// draws in the image slot in place of the host's dark BETA tile
// (brand-logo.tsx is untouched and still draws everywhere else). The
// tile's 32px size and the ROKCT wordmark's face are rokct-landing.css's,
// scoped to the landing root, so no base_sdk change was needed.
//
// One addition to the code: a first visit has no branding cache yet (the
// cache is written by the host's Branding after its server action
// answers, later than this resolver runs), so 1.14.0 to 1.23.0 collapsed
// to the mark with no code until the second visit. When the cache is
// empty the code now comes from the visitor's time zone, for the zones
// the platform serves, in the same superscript style the cache would give
// it (app/config/platform.ts's BRANDING_COUNTRY_* constants); any other
// zone still draws no code rather than a guess.

import type { HeaderMenu } from "@/components/custom/landing/header-menu";
import {
  BRANDING_COUNTRY_SCALE,
  BRANDING_COUNTRY_Y_OFFSET,
  getBrandingSync,
} from "@/app/config/platform";
import t from "@/app/lib/i18n";

/** The redesign's yellow R tile, installed under public/landing/agent/. */
export const RK_MARK = "/landing/agent/rk-mark.svg";

/** The in-page links, in the header's order: section ids from the redesign's meta.nav. */
export const RK_HEADER_ANCHORS = ["ask", "platform", "how", "funding", "plans"] as const;

/** `t(key)`, or `fallback` when the dictionary has no such key. */
function word(key: string, fallback: string): string {
  const value = t(key);
  return value && value !== key ? value : fallback;
}

/** The superscript style getGuestBranding() writes into the cache, for a code that did not come from it. */
export const BRANDING_CODE_STYLE: Record<string, string | number> = {
  display: "inline-block",
  fontSize: BRANDING_COUNTRY_SCALE,
  verticalAlign: "baseline",
  position: "relative",
  top: BRANDING_COUNTRY_Y_OFFSET,
  marginLeft: "0.05em",
  fontWeight: 300,
};

/** Time zones of the countries the platform serves, and their codes. */
export const TIME_ZONE_CODES: Readonly<Record<string, string>> = {
  "Africa/Johannesburg": "ZA",
  "Africa/Gaborone": "BW",
  "Africa/Harare": "ZW",
  "Africa/Maputo": "MZ",
  "Africa/Windhoek": "NA",
  "Africa/Maseru": "LS",
  "Africa/Mbabane": "SZ",
  "Africa/Lusaka": "ZM",
  "Africa/Blantyre": "MW",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
  "Africa/Accra": "GH",
  "Europe/London": "GB",
};

/** The code for a time zone, or null for one the platform does not serve. */
export function codeForTimeZone(zone: string | null | undefined): string | null {
  return (zone && TIME_ZONE_CODES[zone]) || null;
}

function visitorTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

/**
 * The country code beside the collapsed mark: the branding cache the shell
 * keeps on the client, read once after mount, with the inline style the
 * cache carries; with no cache yet (a first visit), the visitor's time
 * zone's code in that same style; else nothing, and the mark collapses
 * alone.
 */
export function brandingCode(): { text: string; style?: Record<string, string | number> } | null {
  const branding = getBrandingSync() as
    | { code?: string | null; style?: Record<string, string | number> }
    | null
    | undefined;
  const text = branding?.code?.trim();
  if (text) return { text, style: branding?.style };
  const zoned = codeForTimeZone(visitorTimeZone());
  return zoned ? { text: zoned, style: BRANDING_CODE_STYLE } : null;
}

const AGENT_HEADER_MENU: HeaderMenu = {
  brand: {
    // The redesign's yellow tile in the image slot, the host's Branding
    // beside it, and the old header's brand motion as it had it (1500ms).
    logo: RK_MARK,
    collapse: { delayMs: 1500, code: brandingCode },
  },
  anchors: [...RK_HEADER_ANCHORS],
  links: [],
  groups: [],
  actions: [
    {
      id: "start",
      label: word("header.start_with_rokct", "Start with ROKCT"),
      href: "/register",
      variant: "primary",
    },
  ],
};

export default AGENT_HEADER_MENU;
