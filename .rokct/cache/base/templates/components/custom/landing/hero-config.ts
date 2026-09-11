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

// Copy and chrome for the generic landing hero (components/custom/hero.tsx).
//
// The hero itself knows nothing about any product feature: everything a
// host wants to say on it lives here, and everything a feature SDK wants to
// add to it (a results panel under the input, extra headline words) arrives
// through the section registry in ./hero-sections.ts. The words below are
// the DEFAULT (rokctapp's): a product whose shell is thin - installed files
// regenerated on every compose, so an edit here does not last - has its
// home SDK register its own copy in ./hero-copy.ts, which the hero lays
// over this config field by field.
//
// Since 1.23.0 the defaults name NO third-party asset (Ray, 2026-09-09:
// "everything served from another company cdn tells you is placeholder"):
// the gradient behind the hero, the Chrome Web Store and Google Play icons
// hotlinked from a chat template's CDN and the "Trusted by 20M+ users"
// claim are gone. The background is empty (the hero hides the block), the
// trust line is empty (the network strip is what stands under the hero
// now), the Chrome badge draws lucide's own Chrome mark as the header's
// extension button does, and the Google Play badge has no icon - a badge
// without one is not drawn until a home SDK's hero copy gives it one.

import { PLATFORM_FEATURES } from "@/app/config/features";
import { PLATFORM_NAME } from "@/app/config/platform";

/** One rotating headline word: "<text> <verb> a chat away". */
export interface HeroWord {
  text: string;
  verb: string;
}

/** A store/platform badge under the hero. */
export interface HeroBadge {
  id: string;
  href: string;
  eyebrow: string;
  label: string;
  /**
   * An image icon (a public path or an absolute URL), or a built-in glyph:
   * "app-store" (the Apple mark) or "chrome" (lucide's Chrome mark, the one
   * the header's extension button draws). Absent, or an image with an
   * empty `src`: the badge is not drawn (below `md` it would be an empty
   * pill), so a badge waits for its icon rather than inventing one. Since
   * 1.26.0 base serves the platform marks itself (./brand-marks.ts:
   * BRAND_MARKS, `/brand/marks/<name>.svg`) - a home SDK's hero copy may
   * hand one to a badge, typed or as the bare path, and base inverts the
   * two monochrome ones (App Store, Windows) on the dark shell.
   */
  icon?: { src: string; alt: string } | "app-store" | "chrome";
}

export interface HeroConfig {
  /** Words the headline cycles through before the suffix. */
  headlineWords: HeroWord[];
  /** The fixed tail of the headline. */
  headlineSuffix: string;
  /** How long each headline word stays, in milliseconds. */
  wordIntervalMs: number;
  /** Typewriter placeholders the empty input cycles through. */
  placeholders: string[];
  /**
   * When the current placeholder contains this token (case-insensitive) the
   * input shows the brand logo instead of the search glyph.
   */
  logoPlaceholderToken: string;
  /** Faint full-bleed background behind the hero. */
  backgroundImage: string;
  /** Short claims shown side by side above the badges; empty hides the row. */
  trustLine: string[];
  /** Store/platform badges; empty hides the block. */
  badges: HeroBadge[];
  /**
   * Where a submitted query goes when NO section is registered in
   * ./hero-sections.ts: the input is then a plain call to action.
   */
  fallbackHref: (query: string, signupUrl: string) => string;
  /**
   * What the hero's wordmark slot shows (since 1.32.0). `"name"` - the
   * default, and what every shell drew before the field existed - draws
   * the host's own wordmark component (components/custom/branding.tsx).
   * `"stem"` draws the platform name's stem as text instead - the part
   * before the first dot with its first character upper-cased, the same
   * rule the header folds a dotted name to (header-menu.ts:
   * brandStemLabel; "acme.school" shows "Acme"), or the whole name,
   * untouched, when it has no dot - with the full name as declared on
   * the element's aria-label and title. Resolved on the server (landing-page.ts:
   * resolveHeroWordmark), so the first HTML already carries the stem; no
   * brand string lives in base, and no shell changes until its home SDK's
   * hero copy declares it.
   */
  brand?: "name" | "stem";
}

const CHROME_BADGE: HeroBadge = {
  id: "chrome",
  href: PLATFORM_FEATURES[1]?.href || "#",
  eyebrow: "Available in the",
  label: "Chrome Web Store",
  icon: "chrome",
};

const GOOGLE_PLAY_BADGE: HeroBadge = {
  id: "google-play",
  href: PLATFORM_FEATURES[3]?.href || "#",
  eyebrow: "GET IT ON",
  label: "Google Play",
  // No icon until a home SDK's hero copy gives it one: the hero does not
  // draw a badge without an icon.
};

const APP_STORE_BADGE: HeroBadge = {
  id: "app-store",
  href: PLATFORM_FEATURES[3]?.href || "#",
  eyebrow: "Download on the",
  label: "App Store",
  icon: "app-store",
};

export const HERO_CONFIG: HeroConfig = {
  headlineWords: [
    { text: "Everything", verb: "is" },
    { text: "Accounting", verb: "is" },
    { text: "ERP", verb: "is" },
  ],
  headlineSuffix: "a chat away",
  wordIntervalMs: 3000,
  placeholders: ["search...", `chat with ${PLATFORM_NAME}`],
  logoPlaceholderToken: PLATFORM_NAME,
  backgroundImage: "",
  trustLine: [],
  badges: [
    ...(PLATFORM_FEATURES[1]?.active ? [CHROME_BADGE] : []),
    ...(PLATFORM_FEATURES[3]?.active ? [GOOGLE_PLAY_BADGE, APP_STORE_BADGE] : []),
  ],
  fallbackHref: (_query, signupUrl) => signupUrl,
  brand: "name",
};
