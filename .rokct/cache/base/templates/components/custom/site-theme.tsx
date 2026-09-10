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

// The shell colour override from data/theme.json (base_sdk 1.35.0; Ray,
// 2026-09-10, on the aquelle study's theme row: a shell-level colour
// override of base). A SERVER component: it reads the bundled theme
// through lib/site-data/read-site-data.ts and renders one <style> with the
// `:root` block lib/site-data/site-theme.ts builds - `--primary`,
// `--secondary`, `--accent`, their `-foreground` pairs, `--ring` and the
// raw `--site-*` hex - so the first HTML already carries the colours.
// Rendered by components/custom/theme-provider.tsx, the seam every host
// layout wraps its page in, so a shell with a theme file gets its colours
// on every route with no layout edit. Nothing at all when the shell has no
// theme file or reads no data/ (backend mode): the markup of every shell
// composed today is unchanged.
//
// Order: the host's app/globals.css first (a <link> in <head>), this block
// after it in <body> (wins over the `:root` and `.dark` token blocks -
// same specificity, later), and a home SDK's own theme after that or on a
// more specific selector (lms_sdk's `.sc-landing { ... }`) wins over this.

import React from "react";

import { hasSiteData, readSiteData } from "@/lib/site-data/read-site-data";
import { SITE_THEME_STYLE_ID, siteThemeCss } from "@/lib/site-data/site-theme";

export function SiteTheme() {
  if (!hasSiteData("theme")) return null;
  const theme = readSiteData("theme");
  if (!theme) return null;
  const css = siteThemeCss(theme);
  if (!css) return null;
  return <style id={SITE_THEME_STYLE_ID}>{css}</style>;
}

export default SiteTheme;
