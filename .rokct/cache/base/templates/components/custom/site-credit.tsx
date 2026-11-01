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

// The site credit (base_sdk 1.54.0): `© <year> <site name>` then `Built
// with ♥ by ROKCT` (Ray, 2026-10-31: "all site will be copyright sitename
// then built with love (as heart) by ROKCT"). The one piece every footer
// draws its last line with - base's FooterChromeRow, and any home SDK
// footer that draws its own markup imports it from
// "@/components/custom/site-credit".
//
// The site's name defaults to the host's PLATFORM_NAME (the site's own
// name, never LEGAL_COMPANY_NAME); a footer whose site names itself in
// data (a local-data site's `site.json`) passes `siteName`. The year is
// the current one unless `year` is given. The heart is an image of its
// own (`role="img"`, `aria-label="love"`), so a screen reader says "Built
// with love by ROKCT". The type and the separator are the footer's: the
// component names no font, size or colour - `className` carries the
// footer's own classes and `separator` its own mark - so each site keeps
// its identity. Server-safe and directive-free: no state, no effects.

import React from "react";

import { PLATFORM_NAME } from "@/app/config/platform";
import {
  SITE_CREDIT_HEART,
  SITE_CREDIT_MAKER,
  SITE_CREDIT_SEPARATOR,
  SITE_CREDIT_LABELS,
  siteCopyright,
  type SiteCreditLabels,
} from "@/components/custom/landing/site-credit";

export interface SiteCreditProps {
  /** The site's own name. Defaults to the host's PLATFORM_NAME. */
  siteName?: string | null;
  /** Defaults to the current year. */
  year?: number | null;
  /** Between the copyright and the credit; defaults to " · ". */
  separator?: React.ReactNode;
  /** The words, for a shell that translates them. */
  labels?: Partial<SiteCreditLabels>;
  /** The footer's own type classes for the line. */
  className?: string;
  /** Classes on the heart alone (a footer that tints it). */
  heartClassName?: string;
  /** The element the line is drawn as; a paragraph by default. */
  as?: "p" | "span" | "div";
}

export function SiteCredit({
  siteName = PLATFORM_NAME,
  year,
  separator = SITE_CREDIT_SEPARATOR,
  labels,
  className,
  heartClassName,
  as: Tag = "p",
}: SiteCreditProps) {
  const words = { ...SITE_CREDIT_LABELS, ...labels };
  const copyright = siteCopyright(siteName, year);
  return (
    <Tag className={className} data-site-credit="">
      {copyright && <span data-site-credit-copyright="">{copyright}</span>}
      {copyright && <span aria-hidden="true">{separator}</span>}
      <span data-site-credit-maker="">
        {words.builtWith}{" "}
        <span role="img" aria-label={words.love} className={heartClassName}>
          {SITE_CREDIT_HEART}
        </span>{" "}
        {words.by} {SITE_CREDIT_MAKER}
      </span>
    </Tag>
  );
}

export default SiteCredit;
