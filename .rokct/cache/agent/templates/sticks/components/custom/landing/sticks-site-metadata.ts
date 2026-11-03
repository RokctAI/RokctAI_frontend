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

// The Sticks site's metadata, for base_sdk's site-metadata registry
// (components/custom/landing/site-metadata.ts): the <title>, description
// and social-card facts the host layout and the generated Open Graph image
// read from ONE registered module. The shape is written out here rather
// than imported from base's file, as the other home SDKs do. `icon` is the
// Sticks mark this block installs at app/icon.svg and public/sticks-icon.svg.
// No `url`: base falls back to the shell's NEXT_PUBLIC_SITE_URL.

import { STICKS_META, STICKS_SITE_NAME } from "@/components/custom/landing/sticks-landing-config";

/** The subset of base_sdk's SiteMetadataCopy this module fills. */
export interface SticksSiteMetadata {
  title: string;
  description: string;
  tagline: string;
  siteName?: string;
  keywords?: string[];
  icon?: string;
  locale?: string;
}

const STICKS_SITE_METADATA: SticksSiteMetadata = {
  siteName: STICKS_SITE_NAME,
  title: STICKS_META.title,
  tagline: STICKS_META.tagline,
  description: STICKS_META.description,
  keywords: STICKS_META.keywords,
  locale: "en_ZA",
  icon: "/sticks-icon.svg",
};

export default STICKS_SITE_METADATA;
