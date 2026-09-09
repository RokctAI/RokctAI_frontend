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
// rokct.ai's hero copy, for base_sdk's hero-copy registry
// (components/custom/landing/hero-copy.ts): ONE field over the defaults -
// the store marks the badges draw.
//
// rokct.ai's hero is base's HERO_CONFIG as it stands - rokctapp's words,
// the store badges gated by the shell's PLATFORM_FEATURES - so this SDK
// registered no copy until 1.15.0 and has nothing to say about the words
// now. What it says is where the badges' MARKS come from. base_sdk 1.23.0
// drew the Chrome Web Store badge with lucide's Chrome glyph, because the
// drawing the old host hero and header used was hot-linked from a third
// party's CDN and base names no third-party host. Ray, 2026-09-09: "i dont
// think merlin owns [the icon] so use it but bring it local" - so 1.15.0
// served the drawing from this SDK's own public file and handed it to base
// through the `{ src, alt }` icon a HeroBadge already takes. The header's
// extension button (./agent-header-menu.ts) names the same file.
//
// Since 1.16.0 the files are base_sdk 1.26.0's: base installs the
// platform marks - chrome-web-store.svg, google-play.svg, app-store.svg,
// app-gallery.svg, windows.svg - under public/brand/marks/ on every host,
// so this SDK ships none of them any more and only NAMES them. Naming the
// path is how a home SDK opts in: the literals below are the paths base
// serves, unchanged from 1.15.0, and the App Store badge now names
// app-store.svg too (Ray, 2026-09-09: rokct.ai gets the same official App
// Store file supacharge.app has) in place of base's built-in Apple glyph,
// so all three of rokct.ai's badges draw their platforms' official marks
// ("we use what these platforms use for familiarity"). The gating and the
// order are HERO_CONFIG's own. No CSS here: base applies the dark-mode
// treatment for the monochrome app-store.svg and windows.svg itself, keyed
// on the src basename, and never filters a coloured mark.

import type { HeroCopy } from "@/components/custom/landing/hero-copy";
import {
  HERO_CONFIG,
  type HeroBadge,
} from "@/components/custom/landing/hero-config";

/**
 * The Chrome Web Store mark, the SVG base_sdk 1.26.0 installs under
 * public/brand/marks/. ./agent-header-menu.ts names the same file for the
 * extension button; keep the two literals identical.
 */
export const CHROME_WEB_STORE_MARK: { src: string; alt: string } = {
  src: "/brand/marks/chrome-web-store.svg",
  alt: "Chrome Web Store",
};

/** The Google Play mark, the coloured Play triangle, the same way. */
export const GOOGLE_PLAY_MARK: { src: string; alt: string } = {
  src: "/brand/marks/google-play.svg",
  alt: "Google Play",
};

/**
 * The App Store mark, Apple's official file, the same way (1.16.0): the
 * file supacharge.app's badge draws, in place of base's built-in glyph.
 */
export const APP_STORE_MARK: { src: string; alt: string } = {
  src: "/brand/marks/app-store.svg",
  alt: "App Store",
};

/**
 * The marks this SDK names, by the id base gives the badge in
 * HERO_CONFIG: base's own files under public/brand/marks/, one per badge
 * rokct.ai's hero draws. A badge not named here keeps base's icon.
 */
export const LOCAL_MARKS: Readonly<Record<string, { src: string; alt: string }>> = {
  chrome: CHROME_WEB_STORE_MARK,
  "google-play": GOOGLE_PLAY_MARK,
  "app-store": APP_STORE_MARK,
};

/**
 * Base's badges with the store marks this SDK names: the same entries,
 * in the same order, every other field untouched.
 */
export function withLocalMarks(badges: readonly HeroBadge[]): HeroBadge[] {
  return badges.map((badge) => {
    const mark = LOCAL_MARKS[badge.id];
    return mark ? { ...badge, icon: mark } : badge;
  });
}

const AGENT_HERO_COPY: HeroCopy = {
  badges: withLocalMarks(HERO_CONFIG.badges),
};

export default AGENT_HERO_COPY;
