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

// corporate_sdk 1.7.0: a local-data site's own sizes, from data/products.json
// - each item's `name` is the size ("500 ml", "1.5 L", "5 L"; the bottle
// drawn is the nearest of 500 ml, 1.5 L and 5 L), its `description` the
// tag's line ("on the go"), `sizes[0]` the words printed on the bottle's
// label ("500 ML") and `sizes[1]` the hero's fact for it ("5 L jug"; the
// name when absent). Server safe.

import type { SiteArt, SitePriceSlider } from "@/lib/site-data/kinds";

import { siteKind } from "./site-source";
import { sizeMlOf, type SizeBottleOpts, type SizeMl } from "./site-sizes-art";

export interface SiteSize {
  ml: SizeMl;
  name: string;
  note?: string;
  /** The words on the bottle's label. */
  label: string;
  /** The hero fact for this size. */
  fact: string;
}

/** The site's sizes, smallest first, one per drawn size (the first item wins). */
export function siteSizes(): SiteSize[] {
  const seen = new Set<SizeMl>();
  const out: SiteSize[] = [];
  for (const item of siteKind("products")?.items ?? []) {
    if (item.status === "coming") continue;
    const ml = sizeMlOf(item.name);
    if (!ml || seen.has(ml)) continue;
    seen.add(ml);
    out.push({ ml, name: item.name, note: item.description, label: item.sizes?.[0] ?? item.name.toUpperCase(), fact: item.sizes?.[1] ?? item.name });
  }
  return out.sort((a, b) => a.ml - b.ml);
}

/** A bottle art's label ground, label art image and cap, for the sized bottles. */
export function srLabelOf(art: SiteArt | undefined): Pick<SizeBottleOpts, "labelBg" | "art" | "cap"> {
  if (!art || art.kind !== "bottle") return {};
  return { labelBg: art.label.bg, art: art.label.art, cap: art.cap };
}

/** 1.7.0: a tier's slider starts at the tier's own minQty, so the minimum order is written once. */
export function sliderFrom(slider: SitePriceSlider, minQty: number | undefined): SitePriceSlider {
  return minQty !== undefined && minQty < slider.max ? { ...slider, min: Math.max(1, minQty) } : slider;
}
