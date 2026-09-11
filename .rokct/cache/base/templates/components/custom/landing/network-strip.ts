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
// Rokct network, and (since 1.40.0) WHICH sites those are. The shape of a
// site and the pure list rules are ./network-sites.ts; the markup is
// components/custom/network-strip.tsx.
//
// Ray, 2026-09-09: rokct.ai no longer lists his other products as plans,
// but a founder on its free opportunities pages must still learn about
// them - a clickable logo strip, headed "Trusted by" ("these products
// already trust rokct as they run on it"). The strip is generic chrome, so
// base draws it; what a home SDK says is the sites themselves (since
// 1.40.0), the heading, the order, which keys to leave out and WHERE it
// goes - after the hero, before the footer anchor of the landing page, in
// the footer row, or not at all.
//
// Since 1.40.0 base carries no site (Ray, 2026-09-11: site names are brand
// content, logos are hostnames, and a shell with no declaration must show
// no strip). The list is the registered config's `sites`; a shell that
// registers none and runs in local or hybrid data mode may commit its own
// `data/network.json` (lib/site-data, kind "network"), which
// components/custom/network-strip.tsx reads through the
// app/actions/base/network-sites.ts action and lays under the config with
// [withOwnNetworkSites]: registered sites win, else the shell's own data,
// else nothing - and with no site the strip renders on no surface
// ([networkStripRendersAt]). The placement default is unchanged (footer on,
// landing off): an existing home SDK's registration keeps its placement and
// gains the strip back the moment it declares its sites.
//
// Since 1.27.0 the strip renders ONCE PER PAGE (Ray, 2026-09-09, on
// rokct.ai showing two "Trusted by" rows: the shell's layout draws its
// footer on every route, /landing included, so a landing placement and
// `footer: true` both landed on the same page). The footer surface yields
// on the landing route whenever the landing placement is not "none" - see
// [networkStripRendersAt] and [isLandingRoute]. And a home SDK whose own
// page section already has the look Ray wants for the row (rokct.ai's
// logos marquee) names the landing placement "section": the section draws
// the resolved strip itself, base's two landing surfaces stay empty and
// the footer still yields on the landing route.
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
// landing page off - over an empty list, so a shell whose home SDK
// registers nothing shows no strip until it, or the shell's data/, names
// the sites.
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
 * right before the footer anchor (after every registered section), inside
 * a page section the home SDK registered and draws itself ("section",
 * since 1.27.0: that section reads the resolved strip through
 * components/custom/network-strip.tsx's loadResolvedNetworkStrip and asks
 * [networkStripRendersAt] for the "section" surface; base's two landing
 * surfaces then draw nothing), or nowhere on that page. The default is
 * "none": the landing page's sections are the home SDK's, and the strip
 * joins them only when asked.
 */
export type NetworkStripLandingPlacement = "afterHero" | "beforeFooter" | "section" | "none";

/** The surfaces the strip can be drawn on; the component names one per render. */
export type NetworkStripSurface = NetworkStripLandingPlacement | "footer";

export interface NetworkStripPlacement {
  /** Where on the landing page; default "none". */
  landing?: NetworkStripLandingPlacement;
  /**
   * Whether the footer row (components/custom/footer-chrome.tsx) carries
   * the strip above the copyright line; default true, so every shell's
   * footer shows the network minus itself with nothing registered. On the
   * landing route the footer surface yields to a landing placement other
   * than "none" (since 1.27.0): one strip per page.
   */
  footer?: boolean;
}

/** What a home SDK supplies. Every field is optional; see the defaults. */
export interface NetworkStripConfig {
  /** The heading over the strip; default "Trusted by" (Ray's wording). */
  heading?: string;
  /**
   * The sites of the network, in default strip order (since 1.40.0). The
   * home SDK that owns the network declares them here; base carries none.
   * Absent leaves the list to the shell's own `data/network.json`
   * ([withOwnNetworkSites]), else to the empty default - so a config that
   * says only WHERE the strip goes draws nothing until the sites arrive.
   * A hidden entry (`shown: false`, `url: null`) may be listed to keep its
   * place.
   */
  sites?: NetworkSite[];
  /** Site keys drawn first, in this order; the rest follow in list order. */
  order?: string[];
  /** Site keys left out on this shell. The shell itself is always left out. */
  hidden?: string[];
  placement?: NetworkStripPlacement;
}

/**
 * The shell's own `data/network.json` (lib/site-data kind "network"),
 * as app/actions/base/network-sites.ts answers it: the heading is
 * optional, the sites are the same shape a config declares. Written out
 * structurally so this pure module imports nothing from lib/site-data.
 */
export interface OwnNetworkSites {
  heading?: string;
  sites: NetworkSite[];
}

/**
 * The registered config with the shell's own data laid UNDER it: the
 * config's `sites` win; with none, the data's sites (and its heading, when
 * the config names none). Null in and nothing to lay under it stays null.
 * Pure; the component and the tests call it alike.
 */
export function withOwnNetworkSites(
  config: NetworkStripConfig | null | undefined,
  own: OwnNetworkSites | null | undefined,
): NetworkStripConfig | null {
  if (config?.sites !== undefined) return config;
  if (!own || own.sites.length === 0) return config ?? null;
  const merged: NetworkStripConfig = { ...(config ?? {}), sites: [...own.sites] };
  if (!config?.heading?.trim() && own.heading?.trim()) merged.heading = own.heading;
  return merged;
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
 * defaults, and the list - the config's `sites` when it declares them,
 * else `sites` (the empty [NETWORK_SITES] by default) - resolved against
 * it and the shell's own host. The component and the tests call it alike.
 */
export function resolveNetworkStrip(
  config: NetworkStripConfig | null | undefined,
  selfHost: string | null | undefined,
  sites: readonly NetworkSite[] = NETWORK_SITES,
): ResolvedNetworkStrip {
  const heading = config?.heading?.trim() || DEFAULT_NETWORK_STRIP_HEADING;
  return {
    heading,
    sites: resolveNetworkSites(config?.sites ?? sites, {
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
 * The landing host's route (app/landing/page.tsx), the one page that has
 * landing surfaces. The shell's layout footer is on it too, which is why
 * [networkStripRendersAt] must know whether a render is on it.
 */
export const LANDING_ROUTE = "/landing";

/**
 * True when `pathname` (next/navigation's usePathname, or any path) is
 * the landing route, trailing slashes ignored; false for null, an empty
 * value and every other route, including the routes under it.
 */
export function isLandingRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === LANDING_ROUTE;
}

/**
 * True when the strip belongs on `surface`: a landing surface when it is
 * the one `placement.landing` names ("none" names neither, "section"
 * names only the section a home SDK draws itself), the footer when
 * `placement.footer` is on - except on the landing route while the
 * landing placement is not "none", where the page already carries the
 * strip (since 1.27.0: once per page) - and never with no site left to
 * draw. `onLandingPage` is [isLandingRoute] of the current pathname; the
 * default false is any other route, where the footer surface is the only
 * one there is.
 */
export function networkStripRendersAt(
  strip: Pick<ResolvedNetworkStrip, "sites" | "placement">,
  surface: NetworkStripSurface,
  onLandingPage = false,
): boolean {
  if (strip.sites.length === 0) return false;
  if (surface === "footer") {
    if (!strip.placement.footer) return false;
    return !(onLandingPage && strip.placement.landing !== "none");
  }
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
