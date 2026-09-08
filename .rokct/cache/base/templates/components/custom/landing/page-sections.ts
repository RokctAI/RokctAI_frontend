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

// Section registry for the generic landing host
// (components/custom/landing-content.tsx).
//
// base_sdk holds only the host: the page, the orchestrator, this registry
// and the hero. Every content section of the page belongs to the home SDK
// of the app being composed (agent_sdk for rokctapp: its floating nav,
// logos, chat, social, features, workflow, pricing, comparison, faq and
// testimonials sections), the way a Dart home SDK holds its own profile
// screens. The orchestrator renders each registered module's default export
// with PageSectionProps, in ascending `meta.order` (registry order breaks
// ties); a module's `meta.nav` adds its floating-nav entries. A shell
// composed with no registered section renders the hero alone.
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

import type { ComponentType } from "react";

import type { LandingPlan } from "@/app/actions/base/landing";
import type { LandingNavItem } from "@/components/custom/landing/landing-config";

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
}

export type PageSectionComponent = ComponentType<PageSectionProps>;

/** The `meta.order` of a module that declares none. */
export const DEFAULT_PAGE_SECTION_ORDER = 100;

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
