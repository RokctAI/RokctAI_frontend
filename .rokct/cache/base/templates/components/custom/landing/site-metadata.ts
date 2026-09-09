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

// Site metadata registry: the words and the picture a link to this shell
// unfurls into (the <title>, the meta description, the Open Graph and
// Twitter cards, and the generated 1200x630 preview image).
//
// Ray, 2026-09-09: each home SDK provides its link-preview details, the
// shell lives in base_sdk. app/layout.tsx is the host's own file and no
// SDK may ship it, so the host layout cannot be where a product's copy
// lives (that is how supacharge ended up with hand-written copy in its
// layout and rokct.ai with a template's leftovers). Instead a home SDK
// installs a module whose default export is a SiteMetadataCopy (or any
// subset of one) and registers it with ONE line at the marker below
// through its manifest integrations:
//
//   { id: "<sdk>-site-metadata", load: () => import("@/components/custom/landing/<file>") },
//
// loadSiteMetadata() lays each registered module's fields over the
// platform default in registry order (an absent field keeps what came
// before, a later entry wins a field it repeats) and app/lib/site-metadata.ts
// turns the result into a Next Metadata object for the host layout and the
// landing page; app/opengraph-image.tsx draws the preview from the same
// copy. With no entry the shell is named after PLATFORM_NAME and unfurls
// without a description, which is honest rather than wrong.
//
// Entries between the markers below are injected by the Rokct SDK installer
// (sdk_installer_base.py update_integrations()) - the same contract as the
// registries in ./hero-copy.ts, ./hero-sections.ts, ./hero-form.ts,
// ./plans-query.ts, ./header-menu.ts and ./page-sections.ts, and a separate
// file for the same reason those are: the installer anchors successive
// entries for a target file after the previous entry, whichever marker they
// named, so one file carries one marker and an entry is a single
// self-contained line with a dynamic import (no import statement of its
// own). Do not remove or reformat the marker comments inside the array
// literal.

import { PLATFORM_NAME } from "@/app/config/platform";

/**
 * The link-preview details a home SDK supplies for its shell.
 *
 * - `title` is the document title of the home page and the default of the
 *   `%s — <siteName>` template every other page's title is set in.
 * - `description` is the meta description and the card description.
 * - `tagline` is the line the generated preview image draws under the
 *   site name; keep it to one short sentence.
 * - `siteName` is the Open Graph site name and the application name;
 *   defaults to PLATFORM_NAME.
 * - `url` is the canonical origin (`https://example.app`); it is the
 *   metadataBase when NEXT_PUBLIC_SITE_URL is not set, and what the
 *   generated image resolves the logo against.
 * - `keywords` feed the meta keywords tag.
 * - `ogImage` is a READY-MADE 1200x630 preview (`.png`, `.jpg`, `.jpeg` or
 *   `.webp`, a public path or an absolute URL). Only such a file is a
 *   valid preview image; anything else (an SVG logo, say) is ignored and
 *   the generated route draws the card instead.
 * - `logo` is the mark the GENERATED preview draws beside the site name
 *   (a public path or an absolute URL; SVG is fine here). It is not a
 *   preview image and is never put in a card tag by itself.
 * - `locale` is the Open Graph locale; defaults to `en_ZA`.
 */
export interface SiteMetadataCopy {
  title: string;
  description: string;
  tagline: string;
  siteName?: string;
  url?: string;
  keywords?: string[];
  ogImage?: string;
  logo?: string;
  locale?: string;
}

/** The shape of a registered site-metadata module. */
export interface SiteMetadataModule {
  default: SiteMetadataCopy | Partial<SiteMetadataCopy>;
}

export interface SiteMetadataEntry {
  /** Stable, unique across SDKs: "<sdk>-site-metadata". */
  id: string;
  load: () => Promise<SiteMetadataModule>;
}

export const SITE_METADATA: SiteMetadataEntry[] = [
  // @rokct-sdk-site-metadata-start
  // @rokct-sdk-site-metadata-end
];

/** What a shell with nothing registered is described as. */
export const DEFAULT_SITE_METADATA: SiteMetadataCopy = {
  title: PLATFORM_NAME,
  siteName: PLATFORM_NAME,
  description: "",
  tagline: "",
};

/** Drops the fields a module left `undefined` so they cannot erase an earlier entry's value. */
function definedFields(
  copy: Partial<SiteMetadataCopy>,
): Partial<SiteMetadataCopy> {
  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(copy)) {
    if (value !== undefined) kept[key] = value;
  }
  return kept as Partial<SiteMetadataCopy>;
}

/**
 * Loads every registered module and merges them in registry order over
 * DEFAULT_SITE_METADATA. A module that fails to load is logged and
 * skipped, so the page still carries a title - the platform's - and the
 * card still renders.
 */
export async function loadSiteMetadata(): Promise<SiteMetadataCopy> {
  const loaded = await Promise.all(
    SITE_METADATA.map(async (entry): Promise<Partial<SiteMetadataCopy>> => {
      try {
        return definedFields((await entry.load()).default ?? {});
      } catch (error) {
        console.error(
          `[site-metadata] failed to load copy "${entry.id}":`,
          error,
        );
        return {};
      }
    }),
  );
  return loaded.reduce<SiteMetadataCopy>(
    (merged, copy) => ({ ...merged, ...copy }),
    { ...DEFAULT_SITE_METADATA },
  );
}
