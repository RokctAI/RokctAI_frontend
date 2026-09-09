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
// cannot: a home SDK has nowhere to put a header link, because the header
// is generic chrome every shell shares (base_sdk ships
// components/custom/header.tsx since 1.14.0; before that it was the host
// shell's own `requires` file). The landing host is the one thing that
// renders that header, so the seam belongs here.
//
// A home SDK installs a module whose default export is a HeaderMenu and
// registers it with ONE line at the marker below through its manifest
// integrations:
//
//   { id: "<sdk>-header-menu", load: () => import("@/components/custom/landing/<file>") },
//
// [loadHeaderMenu] answers the FIRST entry that loads (one page, one header
// menu, exactly as ./hero-form.ts picks one form and ./plans-query.ts picks
// one query). With NOTHING registered it answers `null`, the resolved menu
// is empty and the header (components/custom/header.tsx, shipped by
// base_sdk since 1.14.0) renders no navigation at all: logo, theme toggle
// and the auth links only.
//
// Since 1.14.0 the menu lives INSIDE that header - inline beside the logo
// from the `lg` breakpoint up, behind a burger button below it - rather
// than in a row under the host's own header, and a HeaderMenu may also
// name `groups` and `actions` (call-to-action buttons at the right-hand end
// of the bar).
//
// Since 1.18.0 the groups open as ONE panel, the way rokct.ai's hand-written
// header did before base shipped one (Ray, 2026-09-09: "no mega menu
// anymore" is a regression; rokct keeps everything its old header had). The
// FIRST group is the panel's lead: its label is the word on the single
// desktop trigger and its items form the panel's first column, without a
// repeated heading; every group after it is a headed column beside it. An
// item may carry a `description` and an `icon`, and one that does renders
// as a card (icon box, label, blurb) rather than a bare link - the three
// platform cards of rokct.ai's Product panel. A menu with no groups renders
// exactly as it did in 1.16.0.
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
  /** Optional stable key; the href stands in when absent. */
  id?: string;
  label: string;
  href: string;
  /** The same vocabulary a floating-nav entry uses: "new" or "soon". */
  badge?: LandingNavBadge;
  /** Open in a new tab with rel="noopener noreferrer". */
  external?: boolean;
  /**
   * One line under the label, shown on the desktop panel only (since
   * 1.18.0). An item with a description or an icon renders as a card.
   */
  description?: string;
  /** The card's icon, named from the small set the header bundles. */
  icon?: HeaderMenuIcon;
}

/**
 * The icons a menu item may name (since 1.18.0). A closed set, resolved by
 * components/custom/header-menu.tsx from lucide-react, so the header bundles
 * a handful of glyphs and not the whole icon library: "box" (a product),
 * "globe" (the web), "smartphone" (mobile), "message-square" (chat), "zap"
 * (automation), "wrench" (tools), "file-text" (documents).
 */
export type HeaderMenuIcon =
  | "box"
  | "globe"
  | "smartphone"
  | "message-square"
  | "zap"
  | "wrench"
  | "file-text";

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
  /**
   * Labelled columns of links, rendered after the flat entries as ONE
   * desktop panel under the first group's label (since 1.18.0; 1.14.0 to
   * 1.16.0 opened a dropdown per group). Optional; a menu that names only
   * `anchors`/`links` is resolved exactly as it was before.
   */
  groups?: HeaderMenuGroup[];
  /**
   * Call-to-action buttons at the right-hand end of the header bar, ahead
   * of the theme toggle and the auth links. Optional and new in 1.14.0.
   */
  actions?: HeaderMenuAction[];
}

/**
 * One entry of a group: a fixed link, or `{ anchor }` naming a SECTION id
 * that is resolved against the live nav the same way a top-level anchor is
 * (and dropped the same way when its section is not on the page).
 */
export type HeaderMenuGroupItem = HeaderMenuLink | { anchor: string };

/**
 * A labelled column of the header's panel. The label and badge are the
 * group's own (a group is not a section, so there is no `meta.nav` entry to
 * lift them from); its items follow the anchor and link rules above. A
 * group whose every item was dropped is dropped with them, so a label never
 * opens an empty list. The first group's label is the desktop trigger.
 */
export interface HeaderMenuGroup {
  /** Stable, unique in the menu. */
  id: string;
  label: string;
  badge?: LandingNavBadge;
  items: HeaderMenuGroupItem[];
}

/**
 * A call-to-action button in the header bar (rokct.ai's "Add the Chrome
 * extension" is the model). `primary` paints the platform's primary colour;
 * `ghost` is an outlined button. Taken at face value like a link.
 */
export interface HeaderMenuAction {
  /** Stable, unique in the menu. */
  id: string;
  label: string;
  href: string;
  variant?: "primary" | "ghost";
  /** Open in a new tab with rel="noopener noreferrer". */
  external?: boolean;
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
  /** Unique on the row: the section id, or the link's id, else its href. */
  key: string;
  label: string;
  href: string;
  badge?: LandingNavBadge;
  external?: boolean;
  /** Carried from the link (since 1.18.0); an anchor has neither. */
  description?: string;
  icon?: HeaderMenuIcon;
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
      key: link.id ?? link.href,
      label: link.label,
      href: link.href,
      badge: link.badge,
      external: link.external,
      description: link.description,
      icon: link.icon,
    });
  }

  return items;
}

/** A group with its items resolved: ready to render as a panel column. */
export interface HeaderMenuResolvedGroup {
  id: string;
  label: string;
  badge?: LandingNavBadge;
  items: HeaderMenuItem[];
}

/** Everything the header renders, resolved against the page's live nav. */
export interface ResolvedHeaderMenu {
  /** The flat entries, as [resolveHeaderMenuItems] answers them. */
  items: HeaderMenuItem[];
  /** The panel's columns, each with at least one item; the first leads. */
  groups: HeaderMenuResolvedGroup[];
  /** The call-to-action buttons, in the order the home SDK named them. */
  actions: HeaderMenuAction[];
}

const EMPTY_HEADER_MENU: ResolvedHeaderMenu = { items: [], groups: [], actions: [] };

/**
 * The whole menu the header should render: [resolveHeaderMenuItems]'s flat
 * list, then every group with at least one item left after its anchors were
 * resolved by the same drop-missing rule, then the actions as declared.
 * A `null` menu resolves to three empty lists and the header renders no
 * navigation.
 */
export function resolveHeaderMenu(
  menu: HeaderMenu | null,
  nav: LandingNavItem[],
): ResolvedHeaderMenu {
  if (!menu) return EMPTY_HEADER_MENU;

  const byId = new Map(nav.map((item) => [item.id, item]));
  const groups: HeaderMenuResolvedGroup[] = [];

  for (const group of menu.groups ?? []) {
    const items: HeaderMenuItem[] = [];
    for (const entry of group.items) {
      if ("anchor" in entry) {
        const nav = byId.get(entry.anchor);
        if (!nav) continue;
        items.push({
          key: entry.anchor,
          label: nav.label,
          href: `#${nav.id}`,
          badge: nav.badge,
        });
      } else {
        items.push({
          key: entry.id ?? entry.href,
          label: entry.label,
          href: entry.href,
          badge: entry.badge,
          external: entry.external,
          description: entry.description,
          icon: entry.icon,
        });
      }
    }
    if (items.length === 0) continue;
    groups.push({ id: group.id, label: group.label, badge: group.badge, items });
  }

  return {
    items: resolveHeaderMenuItems(menu, nav),
    groups,
    actions: [...(menu.actions ?? [])],
  };
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
