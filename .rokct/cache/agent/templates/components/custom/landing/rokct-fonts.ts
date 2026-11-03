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

// rokct.ai's three landing faces (1.24.0), the ones Ray approved in the
// redesign concept on 2026-11-01: Bricolage Grotesque for the headings and
// the wordmark, Instrument Sans for the body and JetBrains Mono for the
// small labels. They are bundled woff2 files under ./fonts/rokct/ loaded
// through next/font/local, the way lms_sdk 1.39.1 bundles Supacharge's,
// so composing the shell makes no request to Google Fonts and the page
// makes no runtime font request to anyone.
//
// The files are the Fontsource 5.3.0 builds of the google/fonts OFL
// sources cut to the latin subset: Bricolage Grotesque with all three of
// its axes (opsz 12-96, wdth 75-100, wght 200-800), so the browser's
// optical sizing draws the large headings as tight as the concept does;
// Instrument Sans and JetBrains Mono with their weight axis. Text outside
// latin falls back to the system face. Licence: ./fonts/rokct/OFL.txt
// (SIL Open Font License 1.1). Each face sets a CSS variable that
// rokct-landing.css reads; the variables ride on the landing root through
// RK_ROOT_CLASS (./rokct-landing-classes.ts).

import localFont from "next/font/local";

export const rkDisplay = localFont({
  src: [
    {
      path: "./fonts/rokct/bricolage-grotesque-latin-opsz-wdth-wght.woff2",
      weight: "200 800",
      style: "normal",
    },
  ],
  variable: "--rk-font-display",
  display: "swap",
});

export const rkSans = localFont({
  src: [
    {
      path: "./fonts/rokct/instrument-sans-latin-wght.woff2",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--rk-font-sans",
  display: "swap",
});

export const rkMono = localFont({
  src: [
    {
      path: "./fonts/rokct/jetbrains-mono-latin-wght.woff2",
      weight: "100 800",
      style: "normal",
    },
  ],
  variable: "--rk-font-mono",
  display: "swap",
});
