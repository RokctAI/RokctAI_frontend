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

// Copy registry for the generic landing hero (components/custom/hero.tsx).
//
// The hero renders HERO_CONFIG (./hero-config.ts) - rokctapp's words - and
// a thin shell cannot edit that file durably: installed files are
// regenerated on every compose. So a home SDK supplies its product's hero
// copy the way it supplies its page sections: it installs a module whose
// default export is a HeroCopy and registers it with ONE line at the marker
// below through its manifest integrations:
//
//   { id: "<sdk>-hero", load: () => import("@/components/custom/landing/<file>") },
//
// The hero loads the registered modules on the client and lays each one's
// fields over HERO_CONFIG in registry order: an absent field keeps the
// default, and a later entry wins a field it repeats. While a registered
// module is still loading the hero shows no copy at all rather than the
// default, so a visitor never sees another product's words first. With no
// entry the hero renders HERO_CONFIG from the first paint, exactly as it
// did before this registry existed.
//
// Entries between the markers below are injected by the Rokct SDK installer
// (sdk_installer_base.py update_integrations()) - the same contract as the
// section registries in ./hero-sections.ts and ./page-sections.ts, and a
// separate file for the same reason those are: the installer anchors
// successive entries for a target file after the previous entry, whichever
// marker they named, so one file carries one marker and an entry is a
// single self-contained line with a dynamic import (no import statement of
// its own). Do not remove or reformat the marker comments inside the array
// literal.

import type { HeroConfig } from "@/components/custom/landing/hero-config";

/**
 * The copy a home SDK supplies for the hero: any subset of HeroConfig
 * (headline words and suffix, the word interval, input placeholders, the
 * logo placeholder token, background image, trust line, badges and
 * fallbackHref). Omit a field to keep HERO_CONFIG's value; an empty array
 * hides its block (trustLine, badges) and "" hides the background.
 */
export type HeroCopy = Partial<HeroConfig>;

/** The shape of a registered copy module. */
export interface HeroCopyModule {
  default: HeroCopy;
}

export interface HeroCopyEntry {
  /** Stable, unique across SDKs: "<sdk>-hero". */
  id: string;
  load: () => Promise<HeroCopyModule>;
}

export const HERO_COPY: HeroCopyEntry[] = [
  // @rokct-sdk-hero-copy-start
  // @rokct-sdk-hero-copy-end
];

/**
 * Loads every registered copy module and merges them in registry order. A
 * module that fails to load is logged and skipped, so the hero still
 * renders - on HERO_CONFIG's words for whatever nothing else supplied.
 */
export async function loadHeroCopy(): Promise<HeroCopy> {
  const loaded = await Promise.all(
    HERO_COPY.map(async (entry): Promise<HeroCopy> => {
      try {
        return (await entry.load()).default;
      } catch (error) {
        console.error(`[hero] failed to load copy "${entry.id}":`, error);
        return {};
      }
    }),
  );
  return loaded.reduce<HeroCopy>(
    (merged, copy) => ({ ...merged, ...copy }),
    {},
  );
}
