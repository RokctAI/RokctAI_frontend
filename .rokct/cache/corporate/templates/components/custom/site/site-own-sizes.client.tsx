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

// corporate_sdk 1.7.0: the pricing section's own sizes, side by side at true
// scale (./site-sizes-art.ts). A client module only so the bottles' markup
// is drawn from these few props on both sides instead of travelling in the
// server payload as well as the HTML; it is server-rendered like any other.
"use client";

import React from "react";

import type { SiteSize } from "./site-sizes";
import { sizeBottleSvg, type SizeBottleOpts } from "./site-sizes-art";
import { svgElements } from "./site-svg";

/** px per viewBox unit of the own-label sizes row. */
const OWN_UNIT = 0.3;

export function SiteOwnSizes({ sizes, label }: { sizes: SiteSize[]; label: Pick<SizeBottleOpts, "labelBg" | "art" | "cap"> }) {
  return (
    <figure className="cs-own-sizes md:pr-6">
      {sizes.map((size) => {
        const b = sizeBottleSvg(`own-${size.ml}`, { ml: size.ml, sizeText: size.label, ...label });
        return (
          <div key={size.ml} className="cs-own-size">
            <span className="cs-own-bottle" role="img" aria-label={`${size.name} bottle`} style={{ width: `${(b.W * OWN_UNIT).toFixed(1)}px` }}>
              {svgElements(b.svg)}
            </span>
            <figcaption>
              <b>{size.name}</b>
              {size.note && <span>{size.note}</span>}
            </figcaption>
          </div>
        );
      })}
    </figure>
  );
}
