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

// Plans-query registry for the generic landing host
// (app/actions/base/landing.ts).
//
// The host prefetches ONE list of plans and hands it to every registered
// section. WHICH plans those are is a product decision, not a generic one:
// `LANDING_CONFIG.plansQuery` (./landing-config.ts) names the platform's
// `Subscription Plan` catalog - the plans on which someone RUNS a rokct
// app - and that is right for rokctai_frontend and wrong for a product
// whose landing page sells to its own end users. Supacharge's visitors are
// learners: their catalog is that tenant's own, read through the tenant's
// own gateway cmd, and a thin shell cannot edit the installed
// landing-config.ts durably because the next compose regenerates it.
//
// So the query gets the same seam its sections and its hero copy have: a
// home SDK installs a module whose default export is a LandingPlansQuery
// and registers it with ONE line at the marker below through its manifest
// integrations:
//
//   { id: "<sdk>-plans", load: () => import("@/components/custom/landing/<file>") },
//
// [loadLandingPlansQuery] answers the FIRST entry that loads (one page,
// one plan list, exactly as ./hero-form.ts picks one form). A registered
// module whose default export is `null` is a deliberate "this product
// prefetches no plans" and is honoured as such. With NOTHING registered
// the loop does not run and the answer is `LANDING_CONFIG.plansQuery`
// verbatim - byte for byte the behaviour the host had before this registry
// existed, so rokctai_frontend still reads the Subscription Plan catalog.
//
// Entries between the markers below are injected by the Rokct SDK installer
// (sdk_installer_base.py update_integrations()) - the same contract as
// ./hero-sections.ts, ./hero-copy.ts, ./hero-form.ts and ./page-sections.ts,
// and a separate file for the same reason those are: the installer anchors
// successive entries for a target file after the previous entry, whichever
// marker they named, so one file carries one marker and an entry is a
// single self-contained line with a dynamic import (no import statement of
// its own). Do not remove or reformat the marker comments inside the array
// literal.

import {
  LANDING_CONFIG,
  type LandingPlansQuery,
} from "@/components/custom/landing/landing-config";

/**
 * The shape of a registered query module: a gateway cmd and its payload,
 * or `null` to prefetch nothing at all.
 */
export interface LandingPlansQueryModule {
  default: LandingPlansQuery | null;
}

export interface LandingPlansQueryEntry {
  /** Stable, unique across SDKs: "<sdk>-plans". */
  id: string;
  load: () => Promise<LandingPlansQueryModule>;
}

export const LANDING_PLANS_QUERY: LandingPlansQueryEntry[] = [
  // @rokct-sdk-plans-query-start
  // @rokct-sdk-plans-query-end
];

/**
 * The query the landing page prefetches its plans with: the first
 * registered module that loads, else `LANDING_CONFIG.plansQuery`. An entry
 * that fails to load is logged and skipped in favour of the next one; when
 * none loads the generic default answers, so a broken registration degrades
 * to the platform catalog rather than to a blank pricing section.
 */
export async function loadLandingPlansQuery(): Promise<LandingPlansQuery | null> {
  for (const entry of LANDING_PLANS_QUERY) {
    try {
      return (await entry.load()).default;
    } catch (error) {
      console.error(`[landing] failed to load plans query "${entry.id}":`, error);
    }
  }
  return LANDING_CONFIG.plansQuery;
}
