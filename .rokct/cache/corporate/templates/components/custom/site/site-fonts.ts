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


// The faces a local-data site may choose (corporate_sdk 1.4.0), served
// through next/font: a small allowed set, named in data/theme.json `fonts`
// and validated by base_sdk (lib/site-data/validate-site.mjs DISPLAY_FONTS
// / TEXT_FONTS). next/font needs every face declared statically, so all of
// them are declared here; a page downloads only the files its two faces
// use. Each face's CSS variable is `--cs-font-<name>`, which
// site-theme.ts points `--cs-font-display` / `--cs-font-text` at.

// Since 1.4.2 every face is a bundled woff2 under ./fonts/, loaded through
// next/font/local, so the build makes no request to Google Fonts. The same
// next/font/google failure that hit supacharge-web and polaris-web
// (polaris_sdk 1.8.1) failed southriver-web's Vercel production build on
// main 46cf377: fonts.googleapis.com can answer with
// fonts.gstatic.com/l/font?kit=... URLs that Turbopack's next/font/google
// loader cannot resolve, and a font fetch that fails fails the build.
//
// The variable faces are the google/fonts OFL sources, the versions Google
// Fonts serves, cut to the latin and latin-ext characters and the layout
// features fonts.googleapis.com keeps, with the wght axis limited to the
// weights the next/font/google calls asked for (Montserrat 400-900,
// Figtree 400-700; the whole axis where no weight was named) and every
// other axis pinned where Google pins it (opsz 14; Fraunces SOFT 0, WONK
// default). Google also listed cyrillic, greek and vietnamese faces,
// fetched only for those scripts; text in them now draws in the fallback.
// Playfair Display carries the Reserved Font Name "Playfair Display", so
// its two variable files ship whole (google/fonts' TTFs as woff2, not
// subset or instanced). Licence: ./fonts/OFL.txt (SIL Open Font License
// 1.1). The metric-matched fallback is the one next/font/google drew:
// Times New Roman for the serifs (Fraunces, Playfair Display), Arial (the
// next/font/local default) for the rest.
import localFont from "next/font/local";

import type { SiteDisplayFont, SiteTextFont, SiteTheme } from "@/lib/site-data/kinds";

const montserrat = localFont({
  src: [
    { path: "./fonts/montserrat-wght-400-900.woff2", weight: "400 900", style: "normal" },
    { path: "./fonts/montserrat-wght-400-900-italic.woff2", weight: "400 900", style: "italic" },
  ],
  variable: "--cs-font-montserrat",
  display: "swap",
});
const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-wght-100-900.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/fraunces-wght-100-900-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--cs-font-fraunces",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
const spaceGrotesk = localFont({
  src: [{ path: "./fonts/space-grotesk-wght-300-700.woff2", weight: "300 700", style: "normal" }],
  variable: "--cs-font-space-grotesk",
  display: "swap",
});
const playfairDisplay = localFont({
  src: [
    { path: "./fonts/playfair-display-wght-400-900.woff2", weight: "400 900", style: "normal" },
    { path: "./fonts/playfair-display-wght-400-900-italic.woff2", weight: "400 900", style: "italic" },
  ],
  variable: "--cs-font-playfair-display",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
const figtree = localFont({
  src: [{ path: "./fonts/figtree-wght-400-700.woff2", weight: "400 700", style: "normal" }],
  variable: "--cs-font-figtree",
  display: "swap",
});
const inter = localFont({
  src: [{ path: "./fonts/inter-wght-100-900.woff2", weight: "100 900", style: "normal" }],
  variable: "--cs-font-inter",
  display: "swap",
});
const dmSans = localFont({
  src: [{ path: "./fonts/dm-sans-wght-100-1000.woff2", weight: "100 1000", style: "normal" }],
  variable: "--cs-font-dm-sans",
  display: "swap",
});

const DISPLAY: Record<SiteDisplayFont, { variable: string }> = {
  montserrat,
  fraunces,
  "space-grotesk": spaceGrotesk,
  "playfair-display": playfairDisplay,
};
const TEXT: Record<SiteTextFont, { variable: string }> = { figtree, inter, "dm-sans": dmSans };

/** The next/font class names that define the theme's two face variables. */
export function siteFontClasses(theme: SiteTheme | undefined): string[] {
  const display = DISPLAY[theme?.fonts?.display ?? "montserrat"] ?? montserrat;
  const text = TEXT[theme?.fonts?.text ?? "figtree"] ?? figtree;
  return [text.variable, display.variable];
}
