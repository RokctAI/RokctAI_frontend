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

// data/theme.json to CSS (base_sdk 1.35.0): the pure half of the shell
// colour override. The shells' token set is shadcn's - `--primary`,
// `--secondary`, `--accent` and their `-foreground` pairs as HSL triplets
// read through `hsl(var(--token))` in the host's app/globals.css - so a
// hex colour from the file is written as the triplet those tokens expect,
// with a foreground picked for contrast (white on a dark colour, near-black
// on a light one), plus the raw hex as `--site-<name>` for a section that
// wants the colour itself. `--ring` follows primary, as globals.css sets
// it. The rule is a `:root { ... }` block rendered by
// components/custom/site-theme.tsx inside <body>, so it comes AFTER the
// host's stylesheet and wins over the `:root` and `.dark` blocks there
// (same specificity, later in the document); a home SDK's own theme that
// sets the same variables later in the document, or on a more specific
// selector (lms_sdk's `.sc-landing { --primary: ... }`), still wins over
// it - the order is: globals.css defaults, then data/theme.json, then the
// home SDK's theme.

import type { SiteTheme } from "./kinds";

export const SITE_THEME_STYLE_ID = "site-data-theme";

/** `#rgb` or `#rrggbb` to [r, g, b] in 0..255; null for anything else. */
export function parseHex(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const s = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

/** The shadcn token form: "h s% l%" with one decimal where it matters. */
export function hexToHslTriplet(hex: string): string | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const fmt = (v: number) => String(Math.round(v * 10) / 10);
  return `${fmt(h)} ${fmt(s * 100)}% ${fmt(l * 100)}%`;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The foreground triplet a colour reads best under: white on dark, near-black on light. */
export function contrastForeground(hex: string): string {
  const lum = relativeLuminance(hex) ?? 0;
  // White text up to a luminance of 0.4, near-black above it. The WCAG
  // crossover (0.179) would put black on a saturated red or orange; the
  // shells' own tokens put white on their orange (luminance 0.31) and a
  // brand red reads as white-on-red everywhere, so the line sits higher.
  return lum > 0.4 ? "240 10% 3.9%" : "0 0% 100%";
}

/** The declarations for one token: the triplet, its foreground, the raw hex. */
function tokenDeclarations(name: string, hex: string): string[] {
  const triplet = hexToHslTriplet(hex);
  if (!triplet) return [];
  return [
    `--${name}: ${triplet};`,
    `--${name}-foreground: ${contrastForeground(hex)};`,
    `--site-${name}: ${hex.toLowerCase()};`,
  ];
}

/** The `:root { ... }` block for a theme; "" when it names no colour. */
export function siteThemeCss(theme: SiteTheme): string {
  const declarations = [
    ...tokenDeclarations("primary", theme.primary),
    ...(theme.secondary ? tokenDeclarations("secondary", theme.secondary) : []),
    ...(theme.accent ? tokenDeclarations("accent", theme.accent) : []),
  ];
  const ring = hexToHslTriplet(theme.primary);
  if (ring) declarations.push(`--ring: ${ring};`);
  if (declarations.length === 0) return "";
  return `:root { ${declarations.join(" ")} }`;
}
