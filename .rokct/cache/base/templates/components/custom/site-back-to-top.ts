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

// The Back to top button's configuration for this site (base_sdk 1.56.0),
// resolved once on the server: base's neutral fallback, then the home
// SDK's registered style (./landing/back-to-top-style.ts), then the
// shell's own data/theme.json `backToTop` block (hybrid and local data
// modes; backend shells have no data/ and keep their home SDK's style).
// The theme seam (./theme-provider.tsx) hands the result to every button
// on the page through <BackToTopProvider>, so the root button and any
// framed one read the same config - one button, one look, one switch.
// `siteName` is the text-arrow's default words: a local-data site's
// data/site.json name, else the site-metadata copy's siteName (the home
// SDK's), else its title (PLATFORM_NAME with nothing registered).

import { loadBackToTopStyles } from "@/components/custom/landing/back-to-top-style";
import { DEFAULT_BACK_TO_TOP, resolveBackToTop, type ResolvedBackToTop } from "@/components/custom/landing/back-to-top";
import { loadSiteMetadata } from "@/components/custom/landing/site-metadata";
import { hasSiteData, readSiteData } from "@/lib/site-data/read-site-data";

export interface SiteBackToTop {
  config: ResolvedBackToTop;
  siteName: string;
}

/** Never throws: a broken style or data read leaves the neutral button, never none and never a failed page. */
export async function loadSiteBackToTop(): Promise<SiteBackToTop> {
  try {
    const [styles, metadata] = await Promise.all([loadBackToTopStyles(), loadSiteMetadata()]);
    const theme = hasSiteData("theme") ? readSiteData("theme") : undefined;
    const site = hasSiteData("site") ? readSiteData("site") : undefined;
    return {
      config: resolveBackToTop(...styles, theme?.backToTop),
      siteName: (site?.name || metadata.siteName || metadata.title || "").trim(),
    };
  } catch (error) {
    console.error("[back-to-top] could not resolve the site's style:", error);
    return { config: { ...DEFAULT_BACK_TO_TOP }, siteName: "" };
  }
}
