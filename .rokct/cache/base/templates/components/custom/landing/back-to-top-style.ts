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

// The Back to top button's style registry (base_sdk 1.56.0). Ray,
// 2026-10-31: the button must NOT look the same on every site - base
// supplies only the mechanism (the component, the config and a neutral
// fallback) and each home SDK sets its own default style, chosen to fit
// that brand. A home SDK installs a module whose default export is a
// BackToTopConfig (./back-to-top.ts) and registers it with ONE line at the
// marker below through its manifest integrations:
//
//   { id: "<sdk>-back-to-top", load: () => import("@/components/custom/landing/<file>") },
//
// the same contract as ./site-metadata.ts and the other landing
// registries; entries between the markers are injected by the Rokct SDK
// installer (sdk_installer_base.py update_integrations()). Only the home
// SDK registers here. loadBackToTopStyles() answers every registered
// style in registry order; components/custom/site-back-to-top.ts lays
// them over base's neutral fallback and the shell's data/theme.json
// `backToTop` over them, and the theme seam hands the result to every
// button on the page - the root one and any framed one - so both read the
// same config.
//
// A style should name the site's own tokens rather than copy their values
// (`"var(--radius)"`, `"var(--font-display)"`, `"hsl(var(--primary))"`),
// so the button follows the theme, light and dark.

import type { BackToTopConfig } from "./back-to-top";

/** The shape of a registered style module. */
export interface BackToTopStyleModule {
  default: BackToTopConfig;
}

export interface BackToTopStyleEntry {
  /** Stable, unique across SDKs: "<sdk>-back-to-top". */
  id: string;
  load: () => Promise<BackToTopStyleModule>;
}

export const BACK_TO_TOP_STYLES: BackToTopStyleEntry[] = [
  // @rokct-sdk-back-to-top-style-start
  // @rokct-sdk-back-to-top-style-end
];

/**
 * Every registered style, in registry order. A module that fails to load
 * is logged and skipped: the button falls back to the layers before it,
 * never disappears.
 */
export async function loadBackToTopStyles(
  entries: readonly BackToTopStyleEntry[] = BACK_TO_TOP_STYLES,
): Promise<BackToTopConfig[]> {
  return Promise.all(
    entries.map(async (entry): Promise<BackToTopConfig> => {
      try {
        return (await entry.load()).default ?? {};
      } catch (error) {
        console.error(`[back-to-top] failed to load style "${entry.id}":`, error);
        return {};
      }
    }),
  );
}
