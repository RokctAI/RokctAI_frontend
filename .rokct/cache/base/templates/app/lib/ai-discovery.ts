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

// base_sdk 1.68.0 - sites AI can find (Ray, 11 Nov: "used to submit site to
// google to find you sooner can we auto do same to ai?"; 3 Nov: "can ai auto
// discover them").
//
// Two public files every composed site now serves:
//   /llms.txt          what the site is, in the plain format AI crawlers read
//                      (llmstxt.org): name, summary, tagline, the main links.
//   /indexnow-key.txt  the site's IndexNow key. IndexNow (Bing, Yandex, Seznam,
//                      Naver; ChatGPT search reads Bing) lets a site announce
//                      new pages; the key only proves the site sent the ping,
//                      so it is public by design. It is derived from the host,
//                      so nothing needs setting per site.
// The weekly site refresh (RokctAI/shared-workflows site-refresh.yml, step
// "Announce to search and AI") reads the key and pings IndexNow with the
// site's sitemap URLs.

import { createHash } from "node:crypto";

import type { SiteMetadataCopy } from "@/components/custom/landing/site-metadata";

/** The site's IndexNow key: 32 hex characters derived from its host. */
export function indexNowKey(host: string): string {
  return createHash("sha256").update(`indexnow:${host.trim().toLowerCase()}`).digest("hex").slice(0, 32);
}

/** The llms.txt body for a site (llmstxt.org): H1 name, a quote summary, then links. */
export function llmsTxt(copy: SiteMetadataCopy, siteUrl: string | undefined): string {
  const name = (copy.siteName || copy.title).trim();
  const base = siteUrl?.replace(/\/+$/, "") ?? "";
  const lines = [`# ${name}`, "", `> ${copy.description.trim()}`];
  if (copy.tagline?.trim()) lines.push("", copy.tagline.trim());
  if (base) {
    lines.push("", "## Links", "", `- [Home](${base}/): ${name}`, `- [Sitemap](${base}/sitemap.xml): every public page`);
  }
  return lines.join("\n") + "\n";
}
