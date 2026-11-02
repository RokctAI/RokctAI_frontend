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

// Where the Sticks landing's moving parts come from (agent_sdk 1.24.0,
// app_type sticks). Pure: no React, no Next, no fetch of its own - the
// loaders in sticks-sources.server.ts hand it what GitHub answered, so the
// rules below run the same under node's test runner.
//
// * The app's DOWNLOADS are the newest RokctAI/sticks release (the brief:
//   "read the newest RokctAI/sticks release from the GitHub API and link
//   its release APK (app-vX.apk, never the debug APK) and its Windows
//   installer directly"). pickDownloads() reads the release's assets and
//   links only files that exist: a release with no matching asset leaves
//   that platform out, and no release at all is the "coming soon" state.
//   A link is never made up from a version string.
// * The PHONE SCREENS are the app's own guided tour, captured by the app's
//   CI on every merge (marketing/tour/screenshots/<NN-step_id>.png). The
//   number in front moves when a step is added, so screens are matched by
//   step id (the brief: "Match screens by step id, not by number"):
//   tourScreenFiles() maps each step id to today's file name from the
//   folder listing, and tourScreenUrl() falls back to the last known name
//   when the listing cannot be read.
// * Every screen has a LIGHT and a DARK capture, swapped with the site's
//   theme (Ray, 2026-11-01: why do only some screens follow the theme?).
//   The dark captures are the same tour run in the app's dark theme,
//   committed beside the light ones under marketing/tour/screenshots-dark/
//   with the same file names. tourScreen() answers the dark file only when
//   that listing named it: until the tour commits its dark pass, a screen
//   shows its light capture in both themes, and missingDarkScreens() names
//   the steps still waiting for one.

export const STICKS_APP_REPO = "RokctAI/sticks";
export const STICKS_RELEASES_PAGE = `https://github.com/${STICKS_APP_REPO}/releases`;
export const STICKS_LATEST_RELEASE_API = `https://api.github.com/repos/${STICKS_APP_REPO}/releases/latest`;
export const STICKS_TOUR_DIR = "marketing/tour/screenshots";
export const STICKS_TOUR_LISTING_API = `https://api.github.com/repos/${STICKS_APP_REPO}/contents/${STICKS_TOUR_DIR}?ref=main`;
export const STICKS_TOUR_RAW = `https://raw.githubusercontent.com/${STICKS_APP_REPO}/main/${STICKS_TOUR_DIR}`;
export const STICKS_TOUR_DARK_DIR = "marketing/tour/screenshots-dark";
export const STICKS_TOUR_DARK_LISTING_API = `https://api.github.com/repos/${STICKS_APP_REPO}/contents/${STICKS_TOUR_DARK_DIR}?ref=main`;
export const STICKS_TOUR_DARK_RAW = `https://raw.githubusercontent.com/${STICKS_APP_REPO}/main/${STICKS_TOUR_DARK_DIR}`;

/** The release APK: `app-v1.2.12.apk`, never `app-debug-v1.2.12.apk`. */
export const ANDROID_ASSET = /^app-v\d+(?:\.\d+)*\.apk$/;
/** The Windows installer: `sticks-windows-setup-v1.2.12.exe`. */
export const WINDOWS_ASSET = /^sticks-windows-setup-v\d+(?:\.\d+)*\.exe$/;

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size?: number;
}

export interface ReleasePayload {
  tag_name?: string;
  html_url?: string;
  draft?: boolean;
  prerelease?: boolean;
  assets?: ReleaseAsset[];
}

export interface DownloadLink {
  url: string;
  file: string;
  /** Megabytes, one decimal, when GitHub said how big the file is. */
  sizeMb: number | null;
}

/**
 * What the download buttons draw:
 * - `ready`: the newest release, with each platform whose file it carries;
 * - `none`: GitHub answered and there is no release yet ("coming soon");
 * - `unknown`: GitHub could not be asked; the buttons open the releases page.
 */
export interface Downloads {
  state: "ready" | "none" | "unknown";
  version: string | null;
  releaseUrl: string;
  android: DownloadLink | null;
  windows: DownloadLink | null;
}

function link(asset: ReleaseAsset | undefined): DownloadLink | null {
  if (!asset || typeof asset.browser_download_url !== "string") return null;
  if (!asset.browser_download_url.startsWith("https://github.com/")) return null;
  const size = typeof asset.size === "number" && asset.size > 0 ? Math.round(asset.size / 104857.6) / 10 : null;
  return { url: asset.browser_download_url, file: asset.name, sizeMb: size };
}

/** The buttons for one GitHub answer: a release payload, `null` for "no release" (404), `undefined` for no answer. */
export function pickDownloads(release: ReleasePayload | null | undefined): Downloads {
  if (release === undefined) {
    return { state: "unknown", version: null, releaseUrl: `${STICKS_RELEASES_PAGE}/latest`, android: null, windows: null };
  }
  if (release === null || release.draft) {
    return { state: "none", version: null, releaseUrl: STICKS_RELEASES_PAGE, android: null, windows: null };
  }
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const android = link(assets.find((a) => ANDROID_ASSET.test(a?.name ?? "")));
  const windows = link(assets.find((a) => WINDOWS_ASSET.test(a?.name ?? "")));
  const tag = typeof release.tag_name === "string" && release.tag_name ? release.tag_name : null;
  const releaseUrl =
    typeof release.html_url === "string" && release.html_url.startsWith("https://github.com/")
      ? release.html_url
      : `${STICKS_RELEASES_PAGE}/latest`;
  if (!android && !windows) {
    return { state: "none", version: tag, releaseUrl, android: null, windows: null };
  }
  return { state: "ready", version: tag, releaseUrl, android, windows };
}

/** The tour steps this page shows, with the file name each had when the page was written. */
export const TOUR_FALLBACK: Record<string, string> = {
  sticks_team: "05-sticks_team.png",
  sticks_tasks: "06-sticks_tasks.png",
  sticks_stick: "07-sticks_stick.png",
  sticks_task: "08-sticks_task.png",
  sticks_ask: "09-sticks_ask.png",
  sticks_give: "10-sticks_give.png",
  sticks_profile: "11-sticks_profile.png",
  sticks_hire: "12-sticks_hire.png",
  sticks_setup: "13-sticks_setup.png",
  sticks_inbox: "14-sticks_inbox.png",
  sticks_calls: "15-sticks_calls.png",
  sticks_talk: "16-sticks_talk.png",
  sticks_report: "17-sticks_report.png",
  sticks_settings: "18-sticks_settings.png",
  sticks_lock: "19-sticks_lock.png",
};

export type TourStep = keyof typeof TOUR_FALLBACK;

const TOUR_FILE = /^(\d+)-([a-z0-9_]+)\.png$/;

/** Step id -> today's file name, from the folder listing GitHub returned (anything else is ignored). */
export function tourScreenFiles(listing: unknown): Record<string, string> {
  const files: Record<string, string> = {};
  if (!Array.isArray(listing)) return files;
  for (const entry of listing) {
    const name = entry && typeof entry === "object" ? (entry as { name?: unknown }).name : undefined;
    if (typeof name !== "string") continue;
    const match = TOUR_FILE.exec(name);
    if (match) files[match[2]] = name;
  }
  return files;
}

/** The raw URL of one tour step's screen: today's file when the listing named it, else the last known one. */
export function tourScreenUrl(step: string, files: Record<string, string> = {}): string | null {
  const file = files[step] ?? TOUR_FALLBACK[step];
  return file ? `${STICKS_TOUR_RAW}/${file}` : null;
}

/** Both listings: step id -> file name, light and dark. */
export interface TourFiles {
  light: Record<string, string>;
  dark: Record<string, string>;
}

export interface TourScreen {
  light: string | null;
  /** Only when the tour's dark pass committed this step. */
  dark: string | null;
}

/**
 * THE one place to swap a screen's picture source. Ray (2026-11-01) chose
 * SVG renders drawn in code from the app - one per screen, following the
 * site theme - over tour pictures; until those renders are fixed, every
 * screen shows its tour capture. Put a step here to switch it: `light` is
 * the render's URL (or public path), `dark` its dark twin (omit when the
 * SVG follows the theme by itself). Steps not listed stay on the tour.
 */
export const SCREEN_RENDERS: Partial<Record<string, { light: string; dark?: string }>> = {};

/** One step's light and dark pictures: a render when SCREEN_RENDERS has one, else the tour's captures. */
export function tourScreen(
  step: string,
  files: TourFiles = { light: {}, dark: {} },
  renders: Partial<Record<string, { light: string; dark?: string }>> = SCREEN_RENDERS,
): TourScreen {
  const render = renders[step];
  if (render) return { light: render.light, dark: render.dark ?? null };
  const dark = files.dark[step];
  return {
    light: tourScreenUrl(step, files.light),
    dark: dark ? `${STICKS_TOUR_DARK_RAW}/${dark}` : null,
  };
}

/** The steps this page shows that have no dark capture yet. */
export function missingDarkScreens(steps: readonly string[], files: TourFiles): string[] {
  return steps.filter((step) => !files.dark[step]);
}
