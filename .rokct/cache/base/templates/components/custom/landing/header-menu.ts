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

// Header-menu registry for the generic landing host
// (components/custom/landing-content.tsx).
//
// Ray, looking at the live site: "menus in header and footer are not
// injected". The footer half a home SDK can already answer by itself - its
// own footer section owns that markup, the way lms_sdk's
// lms-footer-section.tsx renders its own link row. The HEADER half it
// cannot: components/custom/header.tsx is a `requires` file, the host
// shell's own (see base/nextjs/manifest.json), so no SDK may ship it and a
// home SDK has nowhere to put a header link. The landing host is the one
// thing that renders that header, so the seam belongs here.
//
// A home SDK installs a module whose default export is a HeaderMenu and
// registers it with ONE line at the marker below through its manifest
// integrations:
//
//   { id: "<sdk>-header-menu", load: () => import("@/components/custom/landing/<file>") },
//
// [loadHeaderMenu] answers the FIRST entry that loads (one page, one header
// menu, exactly as ./hero-form.ts picks one form and ./plans-query.ts picks
// one query). With NOTHING registered it answers `null` and the host
// renders the header exactly as it did before this registry existed - no
// menu row, no wrapper element - so rokctai_frontend, whose header carries
// its own mega menu out of app/config/features.ts, is untouched.
//
// Entries between the markers below are injected by the Rokct SDK installer
// (sdk_installer_base.py update_integrations()) - the same contract as
// ./hero-sections.ts, ./hero-copy.ts, ./hero-form.ts, ./plans-query.ts and
// ./page-sections.ts, and a separate file for the same reason those are:
// the installer anchors successive entries for a target file after the
// previous entry, whichever marker they named, so one file carries one
// marker and an entry is a single self-contained line with a dynamic import
// (no import statement of its own). Do not remove or reformat the marker
// comments inside the array literal.

import type {
  LandingNavBadge,
  LandingNavItem,
} from "@/components/custom/landing/landing-config";

/**
 * One fixed destination in the header menu: a route or an external URL the
 * page does not own an anchor for.
 *
 * `label` is the word on screen, so a shell that translates its chrome
 * passes an already-translated string - this module never reaches for an
 * i18n dictionary, because which dictionary a shell uses is the shell's
 * business.
 */
export interface HeaderMenuLink {
  label: string;
  href: string;
  /** The same vocabulary a floating-nav entry uses: "new" or "soon". */
  badge?: LandingNavBadge;
  /** Open in a new tab with rel="noopener noreferrer". */
  external?: boolean;
}

/**
 * What a home SDK supplies for the header.
 *
 * `anchors` is the interesting half. It names SECTION ids, not hrefs, and
 * the host resolves each one against the nav it has already computed for
 * this render - the list that has been through every section's
 * `meta.renders` predicate. So:
 *
 *  - the label and the badge come from the `meta.nav` entry the home SDK
 *    already owns, and are never restated here (one place to edit when a
 *    section stops being new);
 *  - an id whose section did not render is DROPPED, not linked. A header
 *    link can therefore never scroll to an anchor that is not on the page -
 *    which is the whole reason the `renders` predicate was added to
 *    PageSectionMeta in the first place, and the mistake a second,
 *    hand-written list of hrefs would reintroduce.
 *
 * `links` are appended after the anchors for destinations the page has no
 * section for (a route, an app-store URL). They are taken at face value, so
 * a home SDK must only list a destination that actually resolves.
 */
export interface HeaderMenu {
  anchors?: string[];
  links?: HeaderMenuLink[];
}

/** The shape of a registered menu module. */
export interface HeaderMenuModule {
  default: HeaderMenu | null;
}

export interface HeaderMenuEntry {
  /** Stable, unique across SDKs: "<sdk>-header-menu". */
  id: string;
  load: () => Promise<HeaderMenuModule>;
}

export const HEADER_MENU: HeaderMenuEntry[] = [
  // @rokct-sdk-header-menu-start
  // @rokct-sdk-header-menu-end
];

/**
 * One resolved entry, ready to render: an in-page anchor lifted from the
 * live nav, or a fixed link.
 */
export interface HeaderMenuItem {
  /** Unique on the row: the section id, or the link's href. */
  key: string;
  label: string;
  href: string;
  badge?: LandingNavBadge;
  external?: boolean;
}

/**
 * The menu the header should render: every named anchor that is actually on
 * the page, in the order the home SDK named them, then its fixed links.
 *
 * `nav` is the host's live nav for this render. An anchor id missing from it
 * is silently skipped - the section is not on the page, so neither is its
 * link. A `null` menu, or one that resolves to nothing, yields an empty
 * array and the host then renders no row at all.
 */
export function resolveHeaderMenuItems(
  menu: HeaderMenu | null,
  nav: LandingNavItem[],
): HeaderMenuItem[] {
  if (!menu) return [];

  const byId = new Map(nav.map((item) => [item.id, item]));
  const items: HeaderMenuItem[] = [];

  for (const id of menu.anchors ?? []) {
    const entry = byId.get(id);
    if (!entry) continue;
    items.push({
      key: id,
      label: entry.label,
      href: `#${entry.id}`,
      badge: entry.badge,
    });
  }

  for (const link of menu.links ?? []) {
    items.push({
      key: link.href,
      label: link.label,
      href: link.href,
      badge: link.badge,
      external: link.external,
    });
  }

  return items;
}

/**
 * Loads the first registered menu. An entry that fails to load is logged
 * and skipped in favour of the next one; `null` when nothing is registered
 * or nothing loads, and the header then carries no menu.
 */
export async function loadHeaderMenu(): Promise<HeaderMenu | null> {
  for (const entry of HEADER_MENU) {
    try {
      return (await entry.load()).default;
    } catch (error) {
      console.error(`[landing] failed to load header menu "${entry.id}":`, error);
    }
  }
  return null;
}
