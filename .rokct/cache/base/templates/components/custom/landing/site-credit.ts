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

// The credit every Rokct site ends its footer with (base_sdk 1.54.0). Ray,
// 2026-10-31: "all site will be copyright sitename then built with love
// (as heart) by ROKCT". So the line is the SITE's own name, never the
// legal entity - `© 2026 Polaris · Built with ♥ by Cortex Media` - and the
// maker is the same on every site. Since 1.61.0 the maker is Cortex Media
// (Ray, 2026-11-20: "update all footers of all our nextjs sites to Cortex
// Media. some still say Built with ♥ by ROKCT").
//
// The pure half: the words, the year rule and the plain-text line, with no
// JSX and no product name, so a home SDK's footer that draws its own
// markup (or a test) reaches the same answer the shared component draws.
// components/custom/site-credit.tsx renders it, the heart as an image of
// its own with the word `love` for a screen reader.

/** Who built the site. Fixed by the ruling: every site, the same maker. */
export const SITE_CREDIT_MAKER = "Cortex Media";

/**
 * Where the maker's name links (base_sdk 1.65.0; Ray, 2026-11-21: "Cortex
 * Media can be a link back to its website"). Cortex Media has no domain of
 * its own yet, so this is the address its site is live on today. ONE place:
 * when the real domain arrives, change it here, or set
 * NEXT_PUBLIC_CORTEX_MEDIA_URL on a host to point there sooner.
 */
export const SITE_CREDIT_MAKER_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CORTEX_MEDIA_URL) ||
  "https://hosting-beta-one.vercel.app";

/** The heart glyph drawn between the words (aria-labelled `love`). */
export const SITE_CREDIT_HEART = "♥";

/**
 * What goes between the copyright and the credit when a footer does not
 * name its own separator. A footer keeps its own identity by passing the
 * separator its type already uses.
 */
export const SITE_CREDIT_SEPARATOR = " · ";

/** The words around the heart, overridable for a shell's language. */
export interface SiteCreditLabels {
  /** Before the heart: "Built with". */
  builtWith: string;
  /** The heart's accessible name: "love". */
  love: string;
  /** Between the heart and the maker: "by". */
  by: string;
}

export const SITE_CREDIT_LABELS: SiteCreditLabels = {
  builtWith: "Built with",
  love: "love",
  by: "by",
};

/**
 * The year the copyright names: the one configured when it is a whole,
 * positive number, else the current year.
 */
export function resolveCreditYear(year?: number | null, now: Date = new Date()): number {
  if (typeof year === "number" && Number.isInteger(year) && year > 0) return year;
  return now.getFullYear();
}

/**
 * `© <year> <site name>`, or "" when the site has no name - the line never
 * invents one, and then carries the credit alone.
 */
export function siteCopyright(siteName: string | null | undefined, year?: number | null, now?: Date): string {
  const name = (siteName ?? "").trim();
  if (!name) return "";
  return `© ${resolveCreditYear(year, now)} ${name}`;
}

/** `Built with ♥ by Cortex Media`, in the shell's words when it passes any. */
export function siteCreditText(labels: Partial<SiteCreditLabels> = {}): string {
  const words = { ...SITE_CREDIT_LABELS, ...labels };
  return `${words.builtWith} ${SITE_CREDIT_HEART} ${words.by} ${SITE_CREDIT_MAKER}`;
}

/**
 * The whole line as plain text: `© 2026 Polaris · Built with ♥ by Cortex Media`
 * (the copyright, the separator, the credit), or the credit alone when the
 * site has no name.
 */
export function siteCreditLine(
  siteName: string | null | undefined,
  options: {
    year?: number | null;
    separator?: string;
    labels?: Partial<SiteCreditLabels>;
    now?: Date;
  } = {},
): string {
  const copyright = siteCopyright(siteName, options.year, options.now);
  const credit = siteCreditText(options.labels);
  return copyright ? `${copyright}${options.separator ?? SITE_CREDIT_SEPARATOR}${credit}` : credit;
}
