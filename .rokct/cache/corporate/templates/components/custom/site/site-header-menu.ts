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


// A local-data site's header for base_sdk's header-menu registry: the
// brand slot data/site.json `header.logo` declares ("none" draws the
// wordmark alone; `header.wordmark: false` the image alone), one anchor per section with a nav label, in page order,
// and the one action `header.action` names.
import type { HeaderMenu } from "@/components/custom/landing/header-menu";

import { isExternalHref, resolveHref, siteKind, siteNav } from "./site-source";

function siteHeaderMenu(): HeaderMenu {
  const site = siteKind("site");
  const action = site?.header?.action;
  return {
    // 1.5.0: `header.wordmark: false` draws the logo image alone (it already spells the name).
    brand: { logo: site?.header?.logo ?? "auto", ...(site?.header?.wordmark === false ? { wordmark: false } : {}) },
    anchors: siteNav().map((n) => n.id),
    links: [],
    actions: action
      ? [{ id: "site-action", label: action.label, href: resolveHref(action.href, site), variant: "primary", external: isExternalHref(action.href) }]
      : [],
  };
}

const SITE_HEADER_MENU: HeaderMenu = siteHeaderMenu();
export default SITE_HEADER_MENU;
