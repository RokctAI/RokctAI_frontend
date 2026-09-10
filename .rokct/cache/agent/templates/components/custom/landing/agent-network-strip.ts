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
// other sites of the Rokct network - Supacharge, juvo, and whatever joins
// base's one list next - each a link, under Ray's heading "Trusted by"
// ("these products already trust rokct as they run on it").
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
// base holds that line.
//
// Registered with one line at // @rokct-sdk-network-strip-start through
// this SDK's manifest integrations; against a base_sdk older than 1.23.0
// the registry file is absent, the installer skips the line with a warning
// (sdk_installer_base.py update_integrations: "Integration target not
// found") and this module sits unused - which is why the shape is written
// out here rather than imported from base's file, the way
// agent-site-metadata.ts does it: an `import type` of a module that is
// not on disk is a compile error. The "section" placement is base_sdk
// 1.27.0's: against 1.23.0-1.26.0 the registry's type rejects it, which is
// the floor.

/** The subset of base_sdk >= 1.27.0's NetworkStripConfig this module fills. */
export interface AgentNetworkStrip {
  /** Base's default, "Trusted by", when absent. */
  heading?: string;
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
  placement: {
    landing: "section",
    footer: true,
  },
};

export default AGENT_NETWORK_STRIP;
