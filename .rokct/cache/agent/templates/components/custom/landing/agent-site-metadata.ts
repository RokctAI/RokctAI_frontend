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
// rokct.ai's site metadata, for base_sdk's site-metadata registry
// (components/custom/landing/site-metadata.ts, base_sdk >= 1.15.0): the
// <title>, description and social-card facts the shell's root layout and
// its generated Open Graph / Twitter image read from ONE registered module.
// It exists because the cards rokct.ai shared until now were the Vercel
// "Gemini Chatbot Starter Template" images this SDK carried in
// templates/app/(chat)/opengraph-image.png and twitter-image.png - removed
// in 1.8.0 so base's generated image, drawn from this module, wins.
//
// Registered with one line at // @rokct-sdk-site-metadata-start through
// this SDK's manifest integrations; against base_sdk 1.14.0, which has no
// such file, the installer skips that line with a warning
// (sdk_installer_base.py update_integrations: "Integration target not
// found") and this module simply sits unused.
//
// The shape below is written out here rather than imported from base's
// file for that same reason: an `import type` of a module that is not on
// disk is a compile error, so importing base's SiteMetadataCopy would make
// every base_sdk < 1.15.0 shell fail to build for a feature that base is
// merely not offering yet. The registry checks the default export against
// its own SiteMetadataCopy structurally when it loads this module.
//
// `logo` is the asset base draws into the GENERATED preview image;
// `ogImage` would be a ready-made png/jpg that replaces the generated one,
// and rokct.ai has none any more - that is the point.

/** The subset of base_sdk >= 1.15.0's SiteMetadataCopy this module fills. */
export interface AgentSiteMetadata {
  title: string;
  description: string;
  tagline: string;
  siteName?: string;
  url?: string;
  keywords?: string[];
  /** A ready-made png/jpg preview; none here, base generates one. */
  ogImage?: string;
  /** Asset path drawn into the generated preview image. */
  logo?: string;
  locale?: string;
}

const AGENT_SITE_METADATA: AgentSiteMetadata = {
  siteName: "Rokct",
  url: "https://rokct.ai",
  title: "Rokct — everything is a chat away",
  tagline: "Everything is a chat away",
  description:
    "Rokct is the AI-first business platform: accounting, ERP and your whole workspace, a chat away.",
  keywords: ["AI", "ERP", "accounting", "chat", "Rokct"],
  locale: "en_ZA",
  logo: "/images/logo.svg",
};

export default AGENT_SITE_METADATA;
