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

// Network-strip registry: how THIS shell shows the other sites of the
// Rokct network (the list itself is ./network-sites.ts; the markup is
// components/custom/network-strip.tsx).
//
// Ray, 2026-09-09: rokct.ai no longer lists his other products as plans,
// but a founder on its free opportunities pages must still learn about
// them - a clickable logo strip, headed "Trusted by" ("these products
// already trust rokct as they run on it"). The strip is generic chrome, so
// base draws it and every shell gets it minus itself; what a home SDK may
// say is the heading, the order, which keys to leave out and WHERE it
// goes - after the hero, before the footer anchor of the landing page, in
// the footer row, or not at all.
//
// A home SDK installs a module whose default export is a
// NetworkStripConfig and registers it with ONE line at the marker below
// through its manifest integrations:
//
//   { id: "<sdk>-network-strip", load: () => import("@/components/custom/landing/<file>") },
//
// [loadNetworkStrip] answers the FIRST entry that loads (one shell, one
// strip - the same single-answer rule as ./header-menu.ts, ./hero-form.ts
// and ./plans-query.ts). With NOTHING registered it answers the default:
// heading "Trusted by", list order, nothing hidden, footer on and the
// landing page off - so lms_sdk, the hosting and the delivery home SDKs
// need no change to get the strip in the footer row minus themselves.
//
// Entries between the markers below are injected by the Rokct SDK installer
// (sdk_installer_base.py update_integrations()) - the same contract as the
// other registries in this directory, and a separate file for the same
// reason those are: the installer anchors successive entries for a target
// file after the previous entry, whichever marker they named, so one file
// carries one marker and an entry is a single self-contained line with a
// dynamic import (no import statement of its own). Do not remove or
// reformat the marker comments inside the array literal.

import {
  NETWORK_SITES,
  resolveNetworkSites,
  type LinkableNetworkSite,
  type NetworkSite,
} from "@/components/custom/landing/network-sites";

/**
 * Where on the landing page the strip renders: right under the hero,
 * right before the footer anchor (after every registered section), or
 * nowhere on that page. The default is "none": the landing page's
 * sections are the home SDK's, and the strip joins them only when asked.
 */
export type NetworkStripLandingPlacement = "afterHero" | "beforeFooter" | "none";

/** The surfaces the strip can be drawn on; the component names one per render. */
export type NetworkStripSurface = NetworkStripLandingPlacement | "footer";

export interface NetworkStripPlacement {
  /** Where on the landing page; default "none". */
  landing?: NetworkStripLandingPlacement;
  /**
   * Whether the footer row (components/custom/footer-chrome.tsx) carries
   * the strip above the copyright line; default true, so every shell's
   * footer shows the network minus itself with nothing registered.
   */
  footer?: boolean;
}

/** What a home SDK supplies. Every field is optional; see the defaults. */
export interface NetworkStripConfig {
  /** The heading over the strip; default "Trusted by" (Ray's wording). */
  heading?: string;
  /** Site keys drawn first, in this order; the rest follow in list order. */
  order?: string[];
  /** Site keys left out on this shell. The shell itself is always left out. */
  hidden?: string[];
  placement?: NetworkStripPlacement;
}

/** The shape of a registered network-strip module. */
export interface NetworkStripModule {
  default: NetworkStripConfig | null;
}

export interface NetworkStripEntry {
  /** Stable, unique across SDKs: "<sdk>-network-strip". */
  id: string;
  load: () => Promise<NetworkStripModule>;
}

export const NETWORK_STRIP: NetworkStripEntry[] = [
  // @rokct-sdk-network-strip-start
  // @rokct-sdk-network-strip-end
];

/** The heading with nothing registered. */
export const DEFAULT_NETWORK_STRIP_HEADING = "Trusted by";

/** The placement with nothing registered: the footer row only. */
export const DEFAULT_NETWORK_STRIP_PLACEMENT: Required<NetworkStripPlacement> = {
  landing: "none",
  footer: true,
};

/** Everything the strip draws, resolved for one shell. */
export interface ResolvedNetworkStrip {
  heading: string;
  /** In order, the current shell and the hidden keys already left out. */
  sites: LinkableNetworkSite[];
  placement: Required<NetworkStripPlacement>;
}

/**
 * The pure rule: the registered config (or nothing) laid over the
 * defaults, and the list resolved against it and the shell's own host.
 * The component and the tests call it alike.
 */
export function resolveNetworkStrip(
  config: NetworkStripConfig | null | undefined,
  selfHost: string | null | undefined,
  sites: readonly NetworkSite[] = NETWORK_SITES,
): ResolvedNetworkStrip {
  const heading = config?.heading?.trim() || DEFAULT_NETWORK_STRIP_HEADING;
  return {
    heading,
    sites: resolveNetworkSites(sites, {
      selfHost,
      order: config?.order,
      hidden: config?.hidden,
    }),
    placement: {
      landing: config?.placement?.landing ?? DEFAULT_NETWORK_STRIP_PLACEMENT.landing,
      footer: config?.placement?.footer ?? DEFAULT_NETWORK_STRIP_PLACEMENT.footer,
    },
  };
}

/**
 * True when the strip belongs on `surface`: the footer when
 * `placement.footer` is on, a landing surface when it is the one
 * `placement.landing` names ("none" names neither), and never with no
 * site left to draw.
 */
export function networkStripRendersAt(
  strip: Pick<ResolvedNetworkStrip, "sites" | "placement">,
  surface: NetworkStripSurface,
): boolean {
  if (strip.sites.length === 0) return false;
  if (surface === "footer") return strip.placement.footer;
  if (surface === "none") return false;
  return strip.placement.landing === surface;
}

/**
 * Loads the first registered config. An entry that fails to load is
 * logged and skipped in favour of the next one; `null` when nothing is
 * registered or nothing loads, and the strip then uses the defaults.
 */
export async function loadNetworkStrip(): Promise<NetworkStripConfig | null> {
  for (const entry of NETWORK_STRIP) {
    try {
      return (await entry.load()).default;
    } catch (error) {
      console.error(`[landing] failed to load network strip "${entry.id}":`, error);
    }
  }
  return null;
}
