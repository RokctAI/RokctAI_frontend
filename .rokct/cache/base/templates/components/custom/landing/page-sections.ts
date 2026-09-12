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

// Section registry for the generic landing host (app/landing/page.tsx,
// which since 1.32.0 loads it on the server through
// components/custom/landing/landing-page.ts; the client wrapper is
// components/custom/landing-content.tsx).
//
// base_sdk holds only the host: the page, the orchestrator, this registry
// and the hero. Every content section of the page belongs to the home SDK
// of the app being composed (agent_sdk for rokctapp: its floating nav,
// logos, chat, social, features, workflow, pricing, comparison, faq and
// testimonials sections), the way a Dart home SDK holds its own profile
// screens. The orchestrator renders each registered module's default export
// with PageSectionProps, in ascending `meta.order` (registry order breaks
// ties); a module's `meta.nav` adds its floating-nav entries, and its
// optional `meta.renders` says whether the section belongs on this page at
// all - a section it turns down is neither rendered nor listed in the nav.
// A shell composed with no registered section renders the hero alone.
//
// Since 1.32.0 the registry is imported ON THE SERVER, so a section's ENTRY
// module - the one `load` imports - must be server-safe: it exports `meta`
// and its default component and does NOT start with "use client" (on the
// server every export of a "use client" module is a client reference proxy,
// so meta cannot be read and the loader renders the section with default
// settings - order 100, the entry id as its DOM id, no floating-nav entry,
// no rootClass - and one warning); whatever needs hooks, state, effects,
// browser APIs or
// framer-motion lives in a sibling `<name>.client.tsx` that starts with
// "use client" and that the entry's default export renders; and
// `meta.renders(ctx)` is pure (no window, no localStorage).
//
// Entries between the markers below are injected by the Rokct SDK installer
// (sdk_installer_base.py update_integrations()) - the same contract as the
// hero registry in ./hero-sections.ts, the nav marker in
// app/handson/sidebar-client.tsx and the flag marker in
// app/config/compose.ts. An installed SDK's manifest declares one line per
// section, inserted immediately after the start marker:
//
//   { id: "<file>", load: () => import("@/components/custom/<file>") },
//
// The entry is a dynamic import on purpose: the installer injects lines at
// ONE marker per file (update_integrations() anchors successive entries
// for a target file after the previous entry, whichever marker they named),
// so a contribution must be a single self-contained line with no import
// statement of its own - which is also why this registry is a separate file
// from the hero's. It also means a section is only bundled when it is
// registered, and that a shell composed without the SDK never references
// the missing module. Do not remove or reformat the marker comments inside
// the array literal.
//
// Since 1.38.0 a registered section may name the PAGE it belongs to
// (Ray, 2026-09-10: corporate_sdk owns /about and /team as renderers;
// their content comes from the shell's data/ folder or is empty, and a
// home SDK's cards - Supacharge's founder card - reach those pages through
// THIS registry rather than a second one). `meta.page` is "landing" (the
// default, and what every section registered before 1.38.0 means),
// "about" or "team". The landing host renders only landing sections, so a
// section that names another page is neither drawn nor listed in the
// floating nav there, and a company page asks landing-page.ts's
// `pageSectionsFor(page)` for its own - the same loader, the same
// `meta.renders` and `meta.order` rules, filtered to that page.

import type { ComponentType } from "react";

import type { LandingPlan } from "@/app/actions/base/landing";
import type { LandingNavItem } from "@/components/custom/landing/landing-config";
import type { SiteDataMode } from "@/lib/site-data/kinds";

/** What the landing page hands every registered section. */
export interface PageSectionProps {
  /** The DOM id the floating nav scrolls to: the section's first `meta.nav` id, else `meta.anchor`, else the entry id. */
  id: string;
  signupUrl: string;
  loginUrl: string;
  /** The visitor's session as the page read it through the kernel seam, or null. */
  session?: unknown;
  /** The plans the page prefetched with `LANDING_CONFIG.plansQuery`; empty when there are none. */
  plans: LandingPlan[];
  /** The whole floating nav in page order (hero, every section's entries, footer), for a section that renders the nav itself. */
  nav: LandingNavItem[];
  /**
   * How the shell reads its data (since 1.35.0): the `"data"` mode its
   * composer.json declares - "local" (data/ only, no backend), "backend"
   * (the default; absent means this) or "hybrid". A section that draws
   * backend-only surface (a sign-in row, prices) checks it, and one that
   * serves content from data/ reads the folder through
   * `@/lib/site-data/read-site-data`.
   */
  dataMode?: SiteDataMode;
}

/**
 * The page facts a section may decide on before it is rendered: the same
 * values the page hands it in PageSectionProps. `meta.renders` reads them,
 * so the test that keeps a section off the page is the very test the page
 * asks before giving it a floating-nav tick.
 */
export interface PageSectionContext {
  /** The plans the page prefetched; empty when there are none. */
  plans: LandingPlan[];
  /** The visitor's session as the page read it through the kernel seam, or null. */
  session?: unknown;
  /**
   * The shell's data mode (since 1.35.0), as in PageSectionProps; absent
   * is "backend". `meta.renders` keeps a backend-only section (pricing, a
   * sign-in strip) off a "local" shell with `ctx.dataMode !== "local"`.
   */
  dataMode?: SiteDataMode;
}

export type PageSectionComponent = ComponentType<PageSectionProps>;

/** The `meta.order` of a module that declares none. */
export const DEFAULT_PAGE_SECTION_ORDER = 100;

/**
 * The pages a registered section may belong to (1.38.0): the landing
 * host's page, or one of the company pages corporate_sdk renders. No
 * brand and no route is named here - a page slot is a word the renderer
 * of that page asks the registry for.
 */
export type PageSlot = "landing" | "about" | "team";

export const PAGE_SLOTS: readonly PageSlot[] = ["landing", "about", "team"];

/** What a section with no `meta.page` means: the landing page, as before 1.38.0. */
export const DEFAULT_PAGE_SLOT: PageSlot = "landing";

/** Optional additions a section makes to the page. */
export interface PageSectionMeta {
  /**
   * Where the section renders: ascending, lower first, registry order
   * breaking ties; DEFAULT_PAGE_SECTION_ORDER (100) when absent. The hero
   * is 0 and always first in the flow; a negative order renders before the
   * hero, outside the block the page hides while the hero shows search
   * results - the place for a fixed overlay such as a floating nav.
   */
  order?: number;
  /**
   * Floating-nav entries for this section, in order. The first one's id is
   * the section's own DOM id; the page renders an empty anchor for each of
   * the rest right after the section, so a section can expose sub-anchors
   * without owning the nav. Absent: one entry, the entry id as both id and
   * label. `[]`: no entry (the section is not a nav stop).
   */
  nav?: LandingNavItem[];
  /** The DOM id when the section has no nav entry; the entry id when absent. */
  anchor?: string;
  /**
   * Whether the section belongs on this page at all. A section that draws
   * nothing for some visitors - no plan rows to price, a config slot left
   * empty - says so here rather than returning null from its component,
   * because the page asks this once and then both skips the section and
   * drops its `nav` entries. That is what keeps a floating-nav tick honest:
   * a stop is listed only when there is a section for it to scroll to.
   * Absent: the section always belongs.
   */
  renders?: (ctx: PageSectionContext) => boolean;
  /**
   * Class names the landing page's ROOT element carries from the first
   * HTML (since 1.32.0), space-separated. The page renders on the server
   * now, so a section that themes the landing by putting a class on the
   * document from a client effect (tokens, font variables) would have its
   * first paint unthemed; naming the same classes here puts them on the
   * root that wraps the header, the hero and every section, in the HTML
   * the server sends, so the tokens are there before any script runs.
   * The effect may still run for whatever only <html> can carry. Absent:
   * nothing added. Every present section's value is joined, in page order.
   */
  rootClass?: string;
  /**
   * The page the section belongs to (1.38.0): "landing" when absent -
   * every section registered before this field existed renders exactly
   * where it did. "about" or "team" keeps it OFF the landing page (not
   * drawn, not a nav stop) and hands it to that company page's renderer
   * through `pageSectionsFor(page)` in landing-page.ts, which applies the
   * same `renders` and `order` rules there.
   */
  page?: PageSlot;
  /**
   * Whether the section is part of the SITE FRAME (1.47.0): the chrome a
   * home SDK draws around every page, not only the landing - its theme
   * (the section carrying `rootClass` and the tokens), its footer. A frame
   * section still renders on the landing exactly as its `order` and `page`
   * say; `frame: true` ALSO hands it to components/custom/site-frame.tsx
   * (through `resolveSiteFrame` in landing/site-frame.ts), which draws it
   * around a composed page that sits in the frame (corporate_sdk's /about,
   * /team and /legal): a negative `order` before the page's content, the
   * rest after it, `renders(ctx)` asked the same way. Absent: the landing
   * only, as before. No brand and no route is named here.
   */
  frame?: boolean;
}

/** The page a section's meta puts it on: `meta.page`, or the landing page when it names none. */
export function sectionPageOf(meta: PageSectionMeta | undefined): PageSlot {
  return meta?.page ?? DEFAULT_PAGE_SLOT;
}

/** Whether a section's meta puts it in the site frame (1.47.0): `frame: true`, and nothing else. */
export function sectionFramesSite(meta: PageSectionMeta | undefined): boolean {
  return meta?.frame === true;
}

/** The shape of a registered section's module. */
export interface PageSectionModule {
  default: PageSectionComponent;
  meta?: PageSectionMeta;
}

export interface PageSectionEntry {
  /** Stable, unique on the page: the section's file name under components/custom/. */
  id: string;
  load: () => Promise<PageSectionModule>;
}

export const PAGE_SECTIONS: PageSectionEntry[] = [
  // @rokct-sdk-page-sections-start
  // @rokct-sdk-page-sections-end
];
