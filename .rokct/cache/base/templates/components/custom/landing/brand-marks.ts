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

// The platform marks base serves itself (since 1.26.0). Ray, 2026-09-09:
// "move to base, home sdk can choose to use them or not" - so the five
// store/platform logos agent_sdk 1.15.0 and lms_sdk 1.16.0 each installed
// under their own public/brand/marks/ are ONE set, installed by base
// (templates/public/brand/marks/ -> public/brand/marks/), and every host
// that pins base serves /brand/marks/<name>.svg whether or not its home
// SDK ever names one. Nothing in base draws them by default: the built-in
// HERO_CONFIG badges keep their glyphs ("chrome", "app-store") and the
// header's actions name no image, so a shell that declares nothing renders
// exactly what 1.25.0 rendered. A home SDK OPTS IN by handing a mark's
// `{ src, alt }` to a hero badge's `icon` (hero-copy.ts) or a header
// action's `icon` (header-menu.ts) - typed, from BRAND_MARKS, or as the
// bare path string; both are the same contract.
//
// Two of the five are monochrome tracings (Apple, Windows - Ray: "keep it
// black and white") whose `fill="currentColor"` resolves to BLACK inside an
// <img>, an isolated document that cannot see the badge's text colour.
// Base therefore inverts those two, and only those two, on the dark shell
// (`dark:invert`, the theme provider's `dark` class), keyed on the image
// SRC alone: `isMonoMark(src)` is true for exactly the paths of the
// BRAND_MARKS entries flagged `mono` (/brand/marks/app-store.svg and
// /brand/marks/windows.svg, a cache-busting ?query or #hash ignored), so
// a home SDK that names the path gets the right colour in both themes with
// no flag, no import and no CSS of its own. The coloured marks (Chrome Web
// Store, Google Play, AppGallery) are never filtered. A home SDK must NOT
// add its own invert rule for these paths: lms_sdk 1.16.0's
// `html.sc-landing.dark #hero img[src=...] { filter: invert(1) }` is
// retired in its 1.17.0 for this one.

/** One platform mark base serves under /brand/marks/. */
export interface BrandMark {
  /** The public path the shell serves it at: `/brand/marks/<name>.svg`. */
  readonly src: string;
  /** The alt text an <img> of it carries. */
  readonly alt: string;
  /**
   * True when the drawing is a single-colour tracing in `currentColor`
   * (black inside an <img>), which base inverts on the dark shell; false
   * when it carries its brand colours and is drawn as it is in both themes.
   */
  readonly mono: boolean;
}

/** The public directory the marks live under. */
export const BRAND_MARKS_DIR = "/brand/marks/";

/** The keys of BRAND_MARKS. */
export type BrandMarkId =
  | "chromeWebStore"
  | "googlePlay"
  | "appGallery"
  | "appStore"
  | "windows";

/**
 * The marks, by id. `src` is the literal a home SDK may also write by
 * hand; `alt` the platform's own name for its store.
 */
export const BRAND_MARKS: Readonly<Record<BrandMarkId, BrandMark>> = {
  chromeWebStore: {
    src: `${BRAND_MARKS_DIR}chrome-web-store.svg`,
    alt: "Chrome Web Store",
    mono: false,
  },
  googlePlay: {
    src: `${BRAND_MARKS_DIR}google-play.svg`,
    alt: "Google Play",
    mono: false,
  },
  appGallery: {
    src: `${BRAND_MARKS_DIR}app-gallery.svg`,
    alt: "AppGallery",
    mono: false,
  },
  appStore: {
    src: `${BRAND_MARKS_DIR}app-store.svg`,
    alt: "App Store",
    mono: true,
  },
  windows: {
    src: `${BRAND_MARKS_DIR}windows.svg`,
    alt: "Windows",
    mono: true,
  },
};

/** The srcs of the marks base inverts on the dark shell, from BRAND_MARKS. */
export const MONO_MARK_SRCS: readonly string[] = Object.values(BRAND_MARKS)
  .filter((mark) => mark.mono)
  .map((mark) => mark.src);

/** The Tailwind class a monochrome mark's <img> carries: white on `dark`. */
export const MONO_MARK_CLASS = "dark:invert";

/**
 * The path part of an image src: trimmed, any `?query` or `#hash` dropped.
 * An absolute URL keeps its origin and so never equals a mark's path.
 */
export function markPath(src: string): string {
  const trimmed = src.trim();
  const cut = trimmed.search(/[?#]/);
  return cut === -1 ? trimmed : trimmed.slice(0, cut);
}

/**
 * The invert rule: true for exactly the srcs of the BRAND_MARKS entries
 * flagged `mono` (by path, see markPath); false for every other src, for
 * the coloured marks, for an empty src and for nothing at all.
 */
export function isMonoMark(src: string | null | undefined): boolean {
  if (!src) return false;
  return MONO_MARK_SRCS.includes(markPath(src));
}

/**
 * The class an <img> of `src` adds for dark mode: MONO_MARK_CLASS when
 * isMonoMark(src), else undefined (no class at all, never an empty one).
 * hero.tsx (a badge's image icon) and header-menu.tsx (an action's image
 * icon) both draw through this, so the rule lives in one place.
 */
export function markImageClass(src: string | null | undefined): string | undefined {
  return isMonoMark(src) ? MONO_MARK_CLASS : undefined;
}
