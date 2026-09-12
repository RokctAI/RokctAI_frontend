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

// rokct.ai's say over base_sdk's NETWORK STRIP
// (components/custom/landing/network-strip.ts, base_sdk >= 1.23.0): the
// other sites of the Rokct network - supacharge.school, juvo platforms, and
// whatever joins next - each a link, under Ray's heading "Trusted by"
// ("these products already trust rokct as they run on it").
//
// Since 1.19.0 the SITES themselves are declared HERE (base_sdk 1.40.0;
// Ray, 2026-09-11: a shell with no declaration shows no strip - a shell
// outside the network must not list products it has nothing to do with,
// and site names are brand content base may not hard-code). Base carries
// no site any more: `sites` below is the list base's network-sites.ts held
// from 1.23.0 to 1.39.0, moved entry for entry - rokct.ai, supacharge.school
// and juvo with the same origins and logo paths (the juvo name is Ray's
// "juvo platforms" since 1.19.1; the rest are unchanged), and the two
// products that have no domain yet as the same hidden place-holders (an
// unused surface is switched off, never removed). rokct.ai is the owner of
// the network, so the list lives with rokct.ai's home SDK; another shell
// that wants the strip declares its own list, or commits data/network.json.
//
// Ray, 2026-09-09: rokct.ai must not list his other products as plans any
// more (each has its own shell), but a founder who lands on rokct.ai's
// free opportunities pages must still learn about them. So the strip sits
// in TWO places on this shell, once per page: on /landing it is this SDK's
// own logos section (components/custom/logos.tsx - "rokct already has a
// section called logos", and it keeps its marquee look and function: the
// placement is "section", base_sdk >= 1.27.0, so base's own landing
// surfaces draw nothing there), and on every other page - the
// opportunities pages, careers, legal, status - it is the footer row
// (base's FooterChromeRow, or rokctai_frontend's footer.tsx rendering
// <NetworkStrip surface="footer" />), which base keeps off the landing
// route because the page already carries the strip.
//
// Before 1.17.0 the placement was "afterHero" with the footer on, and the
// shell's layout footer is on /landing too, so the landing page showed
// TWO "Trusted by" rows (Ray, 2026-09-09: "we now have two trusted by
// instead of using the logos section rokct had").
//
// Nothing else is said: the heading is base's default (Ray's wording), the
// order is the list's, nothing is hidden - rokct.ai itself is left out by
// base, which matches the site's host (NEXT_PUBLIC_SITE_URL, else the
// `url` agent-site-metadata.ts registers) against the list. No ad network,
// no click tracking: a link is the site's origin and nothing more, and
// base holds that line (an entry with a query string is never drawn).
//
// Registered with one line at // @rokct-sdk-network-strip-start through
// this SDK's manifest integrations; against a base_sdk older than 1.23.0
// the registry file is absent, the installer skips the line with a warning
// (sdk_installer_base.py update_integrations: "Integration target not
// found") and this module sits unused - which is why the shape is written
// out here rather than imported from base's file, the way
// agent-site-metadata.ts does it: an `import type` of a module that is
// not on disk is a compile error. `sites` is base_sdk 1.40.0's: against
// 1.27.0-1.39.0 the registry's config type rejects the extra property,
// which is the floor.

/**
 * One site, the shape of base_sdk >= 1.40.0's NetworkSite. The logos of a
 * site with two glyphs are named after the TILE its own brand-logo.tsx
 * draws them on, not the page: `logo.svg` is the WHITE glyph and
 * `logo_dark.svg` the BLACK one, and the strip draws the bare glyph on the
 * page, so the black one is the light-theme `logo` and the white one the
 * dark-theme `logoDark`.
 */
export interface AgentNetworkSite {
  key: string;
  /** The brand string the product itself declares, verbatim (base 1.32.1). */
  name: string;
  /** The site's origin, or null for a product with no domain yet (then `shown: false`). */
  url: string | null;
  logo?: string;
  logoDark?: string;
  /** The name IS the logo (a product with no icon yet). */
  wordmark?: boolean;
  shown?: boolean;
}

/** The subset of base_sdk >= 1.40.0's NetworkStripConfig this module fills. */
export interface AgentNetworkStrip {
  /** Base's default, "Trusted by", when absent. */
  heading?: string;
  /** The network, in strip order (base_sdk 1.40.0: base carries none). */
  sites?: AgentNetworkSite[];
  /** Site keys drawn first; the list's order when absent. */
  order?: string[];
  /** Site keys left out on this shell; rokct.ai itself is always left out. */
  hidden?: string[];
  placement?: {
    landing?: "afterHero" | "beforeFooter" | "section" | "none";
    footer?: boolean;
  };
}

const AGENT_NETWORK_STRIP: AgentNetworkStrip = {
  sites: [
    {
      key: "rokct",
      name: "rokct.ai",
      url: "https://rokct.ai",
      logo: "https://rokct.ai/images/logo_dark.svg",
      logoDark: "https://rokct.ai/images/logo.svg",
    },
    {
      key: "supacharge",
      name: "supacharge.school",
      url: "https://supacharge.school",
      wordmark: true,
    },
    // Ray, 2026-09-11 07:43Z: "and juvo is still juvo while i told you its
    // juvo platforms" (first said 2026-09-09 22:07Z). The name is the string
    // he typed, verbatim - never shortened to "juvo", never re-cased here;
    // the url and the glyphs are unchanged.
    {
      key: "juvo",
      name: "juvo platforms",
      url: "https://juvo.app",
      logo: "https://juvo.app/images/logo_dark.svg",
      logoDark: "https://juvo.app/images/logo.svg",
    },
    // No domain yet (Ray, 2026-09-09): listed so the entry has a place, hidden
    // until the url is filled in.
    { key: "hosting", name: "Hosting", url: null, shown: false },
    { key: "telephony", name: "Telephony", url: null, shown: false },
  ],
  placement: {
    landing: "section",
    footer: true,
  },
};

export default AGENT_NETWORK_STRIP;
