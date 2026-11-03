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


// A local-data site's <title>, description and cards for base_sdk's
// site-metadata registry, from data/site.json `name` and `metadata`.
import type { SiteMetadataCopy } from "@/components/custom/landing/site-metadata";

import { siteKind } from "./site-source";

function siteMetadata(): Partial<SiteMetadataCopy> {
  const site = siteKind("site");
  if (!site) return {};
  const m = site.metadata;
  return {
    siteName: site.name,
    title: m.title,
    ...(m.tagline ? { tagline: m.tagline } : {}),
    description: m.description,
    ...(m.keywords ? { keywords: m.keywords } : {}),
    ...(m.themeColor ? { themeColor: m.themeColor } : {}),
    ...(m.locale ? { locale: m.locale } : {}),
    ...(m.icon ? { icon: m.icon } : {}),
  };
}

const SITE_METADATA: Partial<SiteMetadataCopy> = siteMetadata();
export default SITE_METADATA;
