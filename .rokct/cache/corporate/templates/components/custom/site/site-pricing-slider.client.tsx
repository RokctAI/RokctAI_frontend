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

"use client";

// A pricing tier's quantity slider (corporate_sdk 1.5.0): data/pricing.json
// `tiers[].slider`, `min` to `max`, with the count line and a running total
// that follow it ("10 cases · 240 bottles", "10 × R150 · R6.25 a bottle",
// "R1,500"). The only interactive part of a pricing card; every word comes
// from the data's templates (./site-price.ts).
import React, { useId, useState } from "react";

import type { SitePriceSlider } from "@/lib/site-data/kinds";

import { fillPriceWords } from "./site-price";

export function SitePricingSlider({ slider, price, perCase }: { slider: SitePriceSlider; price: string; perCase?: number }) {
  const [n, setN] = useState(slider.min);
  const inputId = useId();
  const words = { n, price, perCase };
  const fill = ((n - slider.min) / (slider.max - slider.min)) * 100;
  const total = fillPriceWords("{total}", words);
  return (
    <div className="cs-slider">
      <div className="row">
        <label htmlFor={inputId} className="k">
          {slider.label}
        </label>
        {slider.count && (
          <span className="count" aria-live="polite">
            {fillPriceWords(slider.count, words)}
          </span>
        )}
      </div>
      <div>
        <input
          id={inputId}
          type="range"
          min={slider.min}
          max={slider.max}
          step={slider.step ?? 1}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          aria-valuetext={slider.count ? fillPriceWords(slider.count, words) : String(n)}
          style={{ ["--fill" as string]: `${fill}%` }}
        />
        <div className="ends" aria-hidden="true">
          <span>{slider.min}</span>
          <span>{slider.max}</span>
        </div>
      </div>
      <div className="row total">
        <div>
          {slider.total && <span className="k">{slider.total}</span>}
          {slider.breakdown && <small>{fillPriceWords(slider.breakdown, words)}</small>}
        </div>
        <output htmlFor={inputId} aria-live="polite">
          {total}
        </output>
      </div>
    </div>
  );
}
