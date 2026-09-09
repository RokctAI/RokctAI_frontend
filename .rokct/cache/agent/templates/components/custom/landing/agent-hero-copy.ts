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
// now. What it says is where the Chrome Web Store badge's MARK comes from.
// base_sdk 1.23.0 draws that badge with lucide's Chrome glyph, because the
// drawing the old host hero and header used was hot-linked from a third
// party's CDN and base names no third-party host. Ray, 2026-09-09: "i dont
// think merlin owns [the icon] so use it but bring it local" - so the
// drawing is this SDK's own public file, templates/public/brand/marks/
// chrome-web-store.svg (installed to public/brand/marks/), handed to base
// through the `{ src, alt }` icon a HeroBadge already takes, exactly as
// lms_sdk hands supacharge.app its Android and Windows marks. The header's
// extension button (./agent-header-menu.ts) names the same file.
//
// The Google Play badge gets its mark the same way (Ray, 2026-09-09, on
// supacharge's marks: "we already have nice icons in buttons in hero of
// rokct ... we use what these platforms use for familiarity"): base 1.23.0
// had left that badge without an icon, so the hero was not drawing it at
// all; google-play.svg is the coloured Play triangle in Google's own
// brand colours, the drawing rokct's hero showed before the strip, as a
// local file. The App Store badge keeps base's Apple glyph; the gating
// and the order are HERO_CONFIG's own. Both marks are multi-colour
// drawings, drawn as they are in both themes - no dark-mode inversion,
// which lms_sdk needs only because its marks are single-colour tracings.

import type { HeroCopy } from "@/components/custom/landing/hero-copy";
import {
  HERO_CONFIG,
  type HeroBadge,
} from "@/components/custom/landing/hero-config";

/**
 * The Chrome Web Store mark, the SVG this SDK installs under
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
 * The marks this SDK serves, by the id base gives the badge in
 * HERO_CONFIG. A badge not named here keeps base's icon (the App Store
 * badge: base's own Apple glyph).
 */
export const LOCAL_MARKS: Readonly<Record<string, { src: string; alt: string }>> = {
  chrome: CHROME_WEB_STORE_MARK,
  "google-play": GOOGLE_PLAY_MARK,
};

/**
 * Base's badges with the store marks this SDK serves: the same entries,
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
