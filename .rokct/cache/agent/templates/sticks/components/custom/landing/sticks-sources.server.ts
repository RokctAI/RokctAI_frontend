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

// The two GitHub reads behind the Sticks landing (agent_sdk 1.24.0): the
// newest RokctAI/sticks release and the app's tour screenshot listing.
// Server only. Both are public, unauthenticated reads cached for an hour
// (Next's fetch cache, `revalidate: 3600`), so the page follows a new
// release or a new tour capture within the hour without a redeploy, and a
// visitor's browser never calls GitHub's API. Neither ever throws: a
// failed read answers `undefined` and sticks-sources.ts turns that into
// the releases-page fallback (downloads) or the last known file names
// (screens).

import "server-only";

import {
  STICKS_LATEST_RELEASE_API,
  STICKS_TOUR_DARK_LISTING_API,
  STICKS_TOUR_LISTING_API,
  pickDownloads,
  tourScreenFiles,
  type Downloads,
  type ReleasePayload,
  type TourFiles,
} from "./sticks-sources";

const HOUR = 3600;
const HEADERS = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };

async function readJson(url: string): Promise<{ status: number; body: unknown } | undefined> {
  try {
    const response = await fetch(url, {
      headers: HEADERS,
      next: { revalidate: HOUR },
      signal: AbortSignal.timeout(6000),
    });
    if (response.status === 404) return { status: 404, body: null };
    if (!response.ok) return undefined;
    return { status: response.status, body: await response.json() };
  } catch {
    return undefined;
  }
}

/** The download buttons' facts. */
export async function loadDownloads(): Promise<Downloads> {
  const answer = await readJson(STICKS_LATEST_RELEASE_API);
  if (!answer) return pickDownloads(undefined);
  if (answer.status === 404) return pickDownloads(null);
  return pickDownloads(answer.body as ReleasePayload);
}

/** Step id -> today's screenshot file name, light and dark (empty when a listing could not be read or does not exist yet). */
export async function loadTourScreens(): Promise<TourFiles> {
  const [light, dark] = await Promise.all([readJson(STICKS_TOUR_LISTING_API), readJson(STICKS_TOUR_DARK_LISTING_API)]);
  return {
    light: light && light.status !== 404 ? tourScreenFiles(light.body) : {},
    dark: dark && dark.status !== 404 ? tourScreenFiles(dark.body) : {},
  };
}
