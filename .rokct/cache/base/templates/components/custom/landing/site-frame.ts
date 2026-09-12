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

// The site frame (base_sdk 1.47.0): the shell the home SDK draws around a
// composed page that is NOT the landing - its header with the registered
// menu, its theme and its footer - so /about, /team and /legal
// (corporate_sdk's pages) read as the same site as /landing. Ray,
// 2026-09-11 20:44Z, of an about page in its own bare frame: "we have no
// way to get here and its so disconnected to the rest of the site".
//
// Nothing new is registered: a home SDK marks the sections that ARE its
// frame - the theme section carrying `rootClass`, the footer - with
// `frame: true` on the `meta` it already exports (page-sections.ts), and
// keeps its header menu where it is (header-menu.ts). [arrangeSiteFrame]
// is the pure rule (the loaded modules in, the frame's shape out; the node
// tests execute it) and [resolveSiteFrame] the loader a page awaits, the
// same loaders and the same `renders` and `order` rules as the landing's
// (landing-page.ts). The header menu is resolved against the LANDING's
// nav, with every anchor pointing back at the landing route
// (`/landing#pricing`), so a link that leads somewhere on the landing
// leads there from the framed page too, and a link the landing drops is
// dropped here as well. With no frame section registered `registered` is
// false and the page keeps its own frame: a shell composed without a home
// landing still renders.
//
// The component that draws the frame is components/custom/site-frame.tsx.

import {
  anchorHrefOn,
  loadHeaderMenu,
  resolveHeaderMenu,
  type ResolvedHeaderMenu,
} from "@/components/custom/landing/header-menu";
import {
  LANDING_CONFIG,
  type LandingNavItem,
} from "@/components/custom/landing/landing-config";
import {
  dropBackendOnlyActions,
  loadPageSections,
  presentSectionsFor,
  type LoadedSection,
} from "@/components/custom/landing/landing-page";
import { LANDING_ROUTE } from "@/components/custom/landing/network-strip";
import {
  DEFAULT_PAGE_SLOT,
  PAGE_SECTIONS,
  sectionFramesSite,
  type PageSectionContext,
  type PageSectionEntry,
} from "@/components/custom/landing/page-sections";

/** The frame's shape, resolved: what to draw around the page, and the header's menu. */
export interface SiteFrameLayout {
  /** Whether a home SDK registered a frame at all: false means the page draws its own. */
  registered: boolean;
  /** Frame sections with a negative order: before the page's content (a theme, an overlay). */
  before: LoadedSection[];
  /** Every other frame section, after the page's content (a footer), in order. */
  after: LoadedSection[];
  /** The header menu, resolved against the landing's nav with anchors on the landing route. */
  menu: ResolvedHeaderMenu;
  /** The landing's floating nav in page order - what the menu's anchors were resolved against. */
  navItems: LandingNavItem[];
  /** Every present frame section's `meta.rootClass`, in order, joined with one space; "" when none. */
  rootClass: string;
}

/** The class names the frame's root carries before any `rootClass`: the landing root's own. */
export const SITE_FRAME_ROOT_CLASS = "flex flex-col min-h-screen bg-white dark:bg-black";

/**
 * The frame sections of `loaded`, in order (1.47.0): every section whose
 * meta says `frame: true`, whatever page it names, asked `renders(ctx)`
 * once each and sorted by `order` (stable, so registry order breaks a tie).
 */
export function frameSectionsOf(
  loaded: LoadedSection[],
  ctx: PageSectionContext,
): LoadedSection[] {
  return loaded
    .filter((s) => sectionFramesSite(s.meta))
    .filter((s) => s.meta.renders?.(ctx) ?? true)
    .sort((a, b) => a.order - b.order);
}

/**
 * The landing's floating nav as the landing arrangement builds it - the
 * hero, every present landing section's entries, the footer - so the
 * frame's header menu resolves against the very anchors the landing has.
 */
export function landingNavItemsOf(
  loaded: LoadedSection[],
  ctx: PageSectionContext,
): LandingNavItem[] {
  const present = presentSectionsFor(DEFAULT_PAGE_SLOT, loaded, ctx);
  return [LANDING_CONFIG.nav.hero, ...present.flatMap((s) => s.nav), LANDING_CONFIG.nav.footer];
}

/**
 * The pure rule: the loaded sections, the page facts and the registered
 * header menu in, the frame's shape out. The menu's anchors lead to
 * `landingRoute` (the landing host's route by default); the `local` rule
 * drops the backend-only actions exactly as the landing does.
 */
export function arrangeSiteFrame(
  loaded: LoadedSection[],
  ctx: PageSectionContext,
  headerMenu: Parameters<typeof resolveHeaderMenu>[0],
  landingRoute: string = LANDING_ROUTE,
): SiteFrameLayout {
  const frame = frameSectionsOf(loaded, ctx);
  const before = frame.filter((s) => s.order < 0);
  const after = frame.filter((s) => s.order >= 0);
  const navItems = landingNavItemsOf(loaded, ctx);
  const menu = resolveHeaderMenu(headerMenu, navItems, anchorHrefOn(landingRoute));
  const rootClass = frame
    .map((s) => s.meta.rootClass?.trim() ?? "")
    .filter((c) => c.length > 0)
    .join(" ");
  return {
    registered: frame.length > 0,
    before,
    after,
    menu: { ...menu, actions: dropBackendOnlyActions(menu.actions, ctx.dataMode) },
    navItems,
    rootClass,
  };
}

/**
 * What a framed page awaits: every registry loaded (a failing module
 * skipped and logged, an unreadable meta rendered with defaults, as on the
 * landing) and the frame arranged. `ctx` defaults to no plans and no
 * session; a page passes its own session and data mode when it read them.
 */
export async function resolveSiteFrame(
  ctx: PageSectionContext = { plans: [], session: null },
  entries: PageSectionEntry[] = PAGE_SECTIONS,
): Promise<SiteFrameLayout> {
  const [loaded, headerMenu] = await Promise.all([loadPageSections(entries), loadHeaderMenu()]);
  return arrangeSiteFrame(loaded, ctx, headerMenu);
}
