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


// data/theme.json to the site stylesheet's variables (corporate_sdk 1.4.0):
// the pure half of a local-data site's look. Every rule in ./site.css reads
// `--cs-*` variables; this writes them on `.cs-site` from the theme's
// palette (light) and paletteDark (dark), fills what a theme leaves out from
// a neutral default keyed to its `primary`, points the two face variables at
// the chosen fonts, sets the display voice, and derives the shadcn tokens
// (--background, --primary, ...) the host's components read. The order on
// the page: ./site.css, then this block, then the site's own data/site.css.

import type { SitePalette, SitePaletteToken, SiteTheme } from "@/lib/site-data/kinds";
import { contrastForeground, hexToHslTriplet } from "@/lib/site-data/site-theme";

export const SITE_ROOT_CLASS = "cs-site";

type Palette = Record<SitePaletteToken, string>;

const NEUTRAL_LIGHT: Omit<Palette, "brand" | "brandHi" | "brandDeep" | "brandDark" | "brandText" | "heroTop" | "heroLow" | "primary"> = {
  paper: "#fafaf9",
  card: "#ffffff",
  alt: "#f3f2f0",
  stroke: "#e5e3df",
  sub: "#ecebe8",
  ink: "#18181b",
  sec: "#57534e",
  faint: "#a8a29e",
  bandInk: "#18181b",
  highlight: "#facc15",
  highlightInk: "#1c1600",
  ok: "#2fbf71",
  onBrand: "#ffffff",
  shade: "#000000",
  shadow: "0 30px 70px -36px rgba(0, 0, 0, 0.35)",
};

const NEUTRAL_DARK: Partial<Palette> = {
  paper: "#0c0a09",
  card: "#1c1917",
  alt: "#161412",
  stroke: "#3a3633",
  sub: "#292524",
  ink: "#f5f5f4",
  sec: "#c7c2bd",
  faint: "#8a847f",
  bandInk: "#1c1917",
  shadow: "0 30px 70px -36px rgba(0, 0, 0, 0.7)",
};

/** The full light palette: the theme's tokens over the neutral default, brand tokens from `primary`. */
export function lightPalette(theme: SiteTheme): Palette {
  const p: SitePalette = theme.palette ?? {};
  const brand = p.brand ?? theme.primary;
  return {
    ...NEUTRAL_LIGHT,
    brand,
    brandHi: brand,
    brandDeep: brand,
    brandDark: brand,
    brandText: brand,
    heroTop: brand,
    heroLow: p.brandDeep ?? brand,
    primary: brand,
    ...p,
  } as Palette;
}

/** The full dark palette: the light one, the neutral dark surfaces, then the theme's paletteDark. */
export function darkPalette(theme: SiteTheme): Palette {
  const light = lightPalette(theme);
  const ownDark = theme.paletteDark ?? {};
  // A theme with its own dark surfaces keeps them; one without gets the
  // neutral dark ones (its brand tokens stay).
  return { ...light, ...NEUTRAL_DARK, ...ownDark } as Palette;
}

function kebab(token: string): string {
  return token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

function paletteDeclarations(p: Palette): string[] {
  return (Object.keys(p) as SitePaletteToken[])
    .filter((t) => t !== "primary")
    .map((t) => `--cs-${kebab(t)}: ${p[t]};`);
}

function triplet(hex: string): string {
  return hexToHslTriplet(hex) ?? "0 0% 50%";
}

/** The shadcn tokens the host's components read, from a palette. */
function shadcnDeclarations(p: Palette): string[] {
  const ink = triplet(p.ink);
  const alt = triplet(p.alt);
  const stroke = triplet(p.stroke);
  return [
    `--background: ${triplet(p.paper)};`,
    `--foreground: ${ink};`,
    `--card: ${triplet(p.card)};`,
    `--card-foreground: ${ink};`,
    `--popover: ${triplet(p.card)};`,
    `--popover-foreground: ${ink};`,
    `--primary: ${triplet(p.primary)};`,
    `--primary-foreground: ${contrastForeground(p.primary)};`,
    `--secondary: ${alt};`,
    `--secondary-foreground: ${ink};`,
    `--muted: ${alt};`,
    `--muted-foreground: ${triplet(p.sec)};`,
    `--accent: ${alt};`,
    `--accent-foreground: ${ink};`,
    `--border: ${stroke};`,
    `--input: ${stroke};`,
    `--ring: ${triplet(p.primary)};`,
  ];
}

/** The face and voice declarations: which next/font variable each face reads. */
function fontDeclarations(theme: SiteTheme): string[] {
  const f = theme.fonts ?? {};
  return [
    `--cs-font-display: var(--cs-font-${f.display ?? "montserrat"});`,
    `--cs-font-text: var(--cs-font-${f.text ?? "figtree"});`,
    `--cs-display-weight: ${f.displayWeight ?? 800};`,
    `--cs-display-style: ${f.displayItalic ? "italic" : "normal"};`,
    `--cs-display-case: ${f.displayUppercase ? "uppercase" : "none"};`,
    `--cs-heading-weight: ${Math.min(800, Math.max(600, (f.displayWeight ?? 800) - 100))};`,
  ];
}

/**
 * The site's variables as one stylesheet: light on `.cs-site`, dark under
 * the host's `.dark` class (on <html>, or on the root itself). The light
 * values are also kept as `--cs-l-*` for the few surfaces that stay light
 * in both schemes (the composition card on a band).
 */
export function siteThemeStylesheet(theme: SiteTheme): string {
  const light = lightPalette(theme);
  const dark = darkPalette(theme);
  const lightCopies = (["ink", "sec", "sub", "faint"] as const).map((t) => `--cs-l-${t}: ${light[t]};`);
  return [
    `.${SITE_ROOT_CLASS} { ${[
      ...paletteDeclarations(light),
      ...lightCopies,
      ...fontDeclarations(theme),
      ...shadcnDeclarations(light),
      "color-scheme: light;",
    ].join(" ")} }`,
    `html.dark .${SITE_ROOT_CLASS}, html.${SITE_ROOT_CLASS}.dark { ${[
      ...paletteDeclarations(dark),
      ...shadcnDeclarations(dark),
      "color-scheme: dark;",
    ].join(" ")} }`,
  ].join("\n");
}
