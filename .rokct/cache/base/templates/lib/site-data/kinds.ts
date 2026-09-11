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

// The shell's host-owned `data/` folder: its kinds, their shapes, and the
// one rule that decides what a reader gets (since base_sdk 1.35.0; Ray,
// 2026-09-10: "do you think we need a data folder for non backend shells?
// so if the folder exist sdks read it?" - "but dont the shell need to
// anounce im local so it look for data/ first?" - "what we cant give sdk
// we can give data/").
//
// A shell that has no backend, or that wants some of its content to live
// with the site rather than in a backend, commits a `data/` folder and
// ANNOUNCES how it is to be read with one top-level key in its own
// composer.json: `"data": "local" | "backend" | "hybrid"` (absent is
// "backend", today's behaviour, byte for byte). `lib/site-data/generate.mjs`
// reads both at BUILD time and writes `lib/site-data/generated.ts`, the
// module every reader imports - so the files are bundled with the app and
// nothing reads the disk at request time (Vercel's functions have no
// `data/` to read). This file is the pure half: the kinds and their types,
// the rule (`resolveSiteData`), no filesystem, no `server-only`, so it is
// importable from anywhere (a client component may import the types) and
// executable under node's test runner.
//
// The brand name is never in data/: it stays where it is declared (the
// home SDK's site-metadata copy and the host's PLATFORM_NAME). data/ carries
// what has no SDK home - colours, people, places, products, prose.

/** How the shell wants its data read; declared in composer.json `"data"`. */
export type SiteDataMode = "local" | "backend" | "hybrid";

export const SITE_DATA_MODES: readonly SiteDataMode[] = ["local", "backend", "hybrid"];

/** What an absent `"data"` key means: today's behaviour, no file is ever read. */
export const DEFAULT_SITE_DATA_MODE: SiteDataMode = "backend";

/** `data/theme.json`: the shell's colours, as hex strings (`#rgb` or `#rrggbb`). */
export interface SiteTheme {
  primary: string;
  secondary?: string;
  accent?: string;
}

/** One link on a team member's card. */
export interface SiteLink {
  label: string;
  href: string;
}

export interface SiteTeamMember {
  name: string;
  role: string;
  /** A public path (`/team/name.jpg`) or an absolute URL. */
  photo?: string;
  links?: SiteLink[];
}

/** `data/team.json`. */
export interface SiteTeam {
  members: SiteTeamMember[];
}

export interface SiteStockist {
  name: string;
  address: string;
  town: string;
  lat?: number;
  lng?: number;
  /** A public maps link for the place; the site draws no map of its own. */
  mapsUrl?: string;
}

/** `data/stockists.json`. */
export interface SiteStockists {
  items: SiteStockist[];
}

export interface SiteProduct {
  name: string;
  description?: string;
  sizes?: string[];
  /** A public path or an absolute URL. */
  image?: string;
  /** "active" (the default when absent) is on sale; "coming" is announced. */
  status?: "active" | "coming";
}

/** `data/products.json`. */
export interface SiteProducts {
  items: SiteProduct[];
}

/** `data/about.md`: the file's markdown, verbatim. */
export type SiteAbout = string;

/** One page under `data/legal/<slug>.md`. */
export interface SiteLegalPage {
  /**
   * From a `title:` line in the file's front matter, else the file's
   * first level-1 heading (which is then removed from `markdown` so a
   * renderer that draws the title does not draw it twice).
   */
  title: string;
  markdown: string;
}

/** `data/legal/`: slug (the file name without `.md`) to page. */
export type SiteLegal = Record<string, SiteLegalPage>;

/**
 * One site of the network strip (`data/network.json`, since 1.40.0): the
 * same shape as `NetworkSite` in
 * components/custom/landing/network-sites.ts, written out here so this
 * seam imports nothing from the components. `url` is the site's https
 * origin (no path, query or fragment), or null for an entry that has no
 * domain yet, which must then be `shown: false`.
 */
export interface SiteNetworkSite {
  key: string;
  name: string;
  url: string | null;
  /** An absolute URL, or a public path on this shell, to the light-theme mark. */
  logo?: string;
  /** Its dark-theme twin. */
  logoDark?: string;
  /** The name IS the logo: drawn as text even with a logo path. */
  wordmark?: boolean;
  /** Default true; false keeps the entry off every strip. */
  shown?: boolean;
}

/**
 * `data/network.json`: the sites the network strip draws on a shell whose
 * home SDK registers none, and the heading over them (the strip's default
 * when absent). A shell with neither shows no strip.
 */
export interface SiteNetwork {
  heading?: string;
  sites: SiteNetworkSite[];
}

/** Every kind, keyed by the name a reader asks for. */
export interface SiteDataKinds {
  theme: SiteTheme;
  team: SiteTeam;
  stockists: SiteStockists;
  products: SiteProducts;
  about: SiteAbout;
  legal: SiteLegal;
  network: SiteNetwork;
}

export type SiteDataKind = keyof SiteDataKinds;

export const SITE_DATA_KINDS: readonly SiteDataKind[] = [
  "theme",
  "team",
  "stockists",
  "products",
  "about",
  "legal",
  "network",
];

/** Where each kind lives under the shell root, as the error messages name it. */
export const SITE_DATA_FILES: Readonly<Record<SiteDataKind, string>> = {
  theme: "data/theme.json",
  team: "data/team.json",
  stockists: "data/stockists.json",
  products: "data/products.json",
  about: "data/about.md",
  legal: "data/legal/<slug>.md",
  network: "data/network.json",
};

/**
 * What the generator writes into `generated.ts`: the declared mode and the
 * kinds whose files were present and valid at build time.
 */
export interface SiteDataBundle {
  mode: SiteDataMode;
  files: Partial<SiteDataKinds>;
}

/** The bundle a shell that never ran the generator carries: backend mode, no files. */
export const EMPTY_SITE_DATA: SiteDataBundle = { mode: "backend", files: {} };

/** The sentence a `local` shell fails with when a kind it is asked for has no file. */
export function missingSiteDataMessage(kind: SiteDataKind): string {
  return (
    `[site-data] data mode is "local" but ${SITE_DATA_FILES[kind]} is missing: ` +
    `a local shell serves "${kind}" from its data/ folder only, so add the file ` +
    `(or declare "data": "hybrid" in composer.json to fall back to the backend).`
  );
}

/**
 * The rule. `backend`: undefined, always - no file is read, whatever data/
 * holds. `hybrid`: the file when it was bundled, else undefined, and the
 * caller falls back to the backend. `local`: the file, or an Error naming
 * the missing file - a local shell has nothing to fall back to.
 */
export function resolveSiteData<K extends SiteDataKind>(
  bundle: SiteDataBundle,
  kind: K,
): SiteDataKinds[K] | undefined {
  if (bundle.mode === "backend") return undefined;
  const value = bundle.files[kind];
  if (value !== undefined) return value;
  if (bundle.mode === "local") throw new Error(missingSiteDataMessage(kind));
  return undefined;
}

/**
 * Whether `resolveSiteData` would answer a value: false in `backend` mode
 * and for a kind with no file, never a throw - so a renderer in `hybrid`
 * mode can choose between data/ and its backend without a try/catch.
 */
export function hasSiteDataIn(bundle: SiteDataBundle, kind: SiteDataKind): boolean {
  return bundle.mode !== "backend" && bundle.files[kind] !== undefined;
}
