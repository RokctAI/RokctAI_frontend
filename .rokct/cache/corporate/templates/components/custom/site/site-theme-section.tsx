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


// A local-data site's look, registered as the first entry of base_sdk's
// landing host (order -2, frame, rootClass): the stylesheet (./site.css),
// the theme's variables from data/theme.json (./site-theme.ts), then the
// site's own data/site.css, and the root classes. Renders no visible box.
import "./site.css";

import React from "react";

import type { PageSectionMeta, PageSectionProps } from "@/components/custom/landing/page-sections";

import { siteFontClasses } from "./site-fonts";
import { isDataSite, siteKind } from "./site-source";
import { SITE_ROOT_CLASS, siteThemeStylesheet } from "./site-theme";
import { SiteThemeClasses } from "./site-theme.client";

const theme = siteKind("theme");
const ROOT_CLASSES: readonly string[] = [SITE_ROOT_CLASS, ...siteFontClasses(theme)];

export const meta: PageSectionMeta = {
  order: -2,
  nav: [],
  anchor: "site-theme",
  rootClass: ROOT_CLASSES.join(" "),
  frame: true,
  renders: () => isDataSite(),
};

export default function SiteThemeSection(_props: PageSectionProps) {
  const css = [theme ? siteThemeStylesheet(theme) : "", siteKind("css") ?? ""].filter(Boolean).join("\n");
  return (
    <>
      {/* React writes a <style> child as raw CSS, escaping only a closing style tag. */}
      {css && <style data-site-theme="">{css}</style>}
      <SiteThemeClasses classes={ROOT_CLASSES} />
    </>
  );
}
