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
  /** An image icon, or the built-in Apple glyph. */
  icon: { src: string; alt: string } | "app-store";
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
}

const CHROME_BADGE: HeroBadge = {
  id: "chrome",
  href: PLATFORM_FEATURES[1]?.href || "#",
  eyebrow: "Available in the",
  label: "Chrome Web Store",
  icon: {
    src: "https://cdn.getmerlin.in/cms/Chrome_Web_Store_icon_5e2d8a5a4f.svg",
    alt: "Chrome",
  },
};

const GOOGLE_PLAY_BADGE: HeroBadge = {
  id: "google-play",
  href: PLATFORM_FEATURES[3]?.href || "#",
  eyebrow: "GET IT ON",
  label: "Google Play",
  icon: {
    src: "https://cdn.getmerlin.in/cms/Google_Play_logo_64f9907f74.svg",
    alt: "Google Play",
  },
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
  backgroundImage:
    "https://cdn.getmerlin.in/cms/Gradient_Animation_2_a3db99fe6f.png",
  trustLine: ["Trusted by 20M+ users", "Install on all platforms"],
  badges: [
    ...(PLATFORM_FEATURES[1]?.active ? [CHROME_BADGE] : []),
    ...(PLATFORM_FEATURES[3]?.active ? [GOOGLE_PLAY_BADGE, APP_STORE_BADGE] : []),
  ],
  fallbackHref: (_query, signupUrl) => signupUrl,
};
