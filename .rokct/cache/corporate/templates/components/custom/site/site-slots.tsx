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


// The page sections of a local-data site, as slots in base_sdk's landing
// host. base's page-sections registry is a fixed list of modules, each with
// its own `meta` (order, nav stop, DOM id); a data page has as many sections
// as its data/sections.json lists. So the manifest registers SITE_SLOTS
// numbered slots, each `import(...).then((m) => m.slot(i))`, and slot i
// draws the i-th section after the hero: its order is 10 + i, its nav stop
// the section's `nav` label (with `id` as the DOM id), and `renders` says
// no when the page has fewer sections than the slot's number - so an empty
// slot is neither drawn nor listed in the nav.
import React from "react";

import type { PageSectionMeta, PageSectionModule, PageSectionProps } from "@/components/custom/landing/page-sections";

import { SiteSectionView } from "./site-sections";
import { siteBodySections } from "./site-source";

/** How many slots the manifest registers: the most sections a page may have after its hero. */
export const SITE_SLOTS = 12;

export function slot(i: number): PageSectionModule {
  const section = siteBodySections()[i];
  const meta: PageSectionMeta = {
    order: 10 + i,
    nav: section?.id && section.nav ? [{ id: section.id, label: section.nav }] : [],
    anchor: section?.id ?? `site-section-${i + 1}`,
    renders: () => section !== undefined,
  };
  function SiteSlot({ id }: PageSectionProps) {
    return section ? <SiteSectionView id={section.id ? id : undefined} section={section} /> : null;
  }
  SiteSlot.displayName = `SiteSlot${i + 1}`;
  return { default: SiteSlot, meta };
}
