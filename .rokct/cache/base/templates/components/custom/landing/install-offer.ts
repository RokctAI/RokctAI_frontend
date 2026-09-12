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

// The install offer's rules (since 1.41.0), the pure half of
// components/custom/install-offer.tsx. Ray, 2026-09-11: "this nextjs has
// install, it does show on mobile though i havent seen it in desktop i
// think it installs as pwa but i think it should check the platform and
// offer app of that platform". So: read the platform the visitor is on
// ([detectPlatform]), pick the download the shell declared for it
// ([pickDownload]), and only with none declared fall back to the
// browser's own install prompt. No user-agent string, platform name or
// store is known here beyond the tokens the detection reads; the entries
// and every word on screen arrive from the home SDK.

import type {
  DownloadEntry,
  DownloadPlatform,
} from "@/components/custom/landing/footer-chrome-config";

/**
 * What the detection reads: the User-Agent Client Hints platform
 * (`navigator.userAgentData.platform`) when the browser exposes it, and
 * the user-agent string as the fallback. Both optional, so a server, a
 * test or a browser with neither answers `null`.
 */
export interface PlatformHints {
  uaDataPlatform?: string | null;
  userAgent?: string | null;
}

/**
 * The platform the hints describe, or `null` when they describe none.
 *
 * The client-hints platform is read first: its values are a closed set
 * ("Android", "iOS", "macOS", "Windows", "Linux", ...), so a match there
 * is the answer. Otherwise the user-agent string, in an order that keeps
 * a broader token from shadowing a narrower one: iPhone/iPad before Mac
 * (an iPad's string says "like Mac OS X"), HarmonyOS/HUAWEI before
 * Android (a Huawei phone's string says "Android" too - and its own
 * store is the one to offer first; [pickDownload] falls back to Android
 * for it), Android before Linux (an Android string says "Linux"), and
 * Windows before all of those bar iOS (no string of theirs says "Win").
 * A string that names none of them is `null`, not "web": the offer then
 * has nothing to pick and falls back to the browser's install prompt.
 */
export function detectPlatformFrom(hints: PlatformHints): DownloadPlatform | null {
  const fromHints = platformFromUaData(hints.uaDataPlatform);
  if (fromHints) return fromHints;
  const ua = (hints.userAgent ?? "").trim();
  if (ua.length === 0) return null;
  if (/\b(?:iPhone|iPad|iPod)\b/i.test(ua)) return "ios";
  if (/HarmonyOS|HUAWEI/i.test(ua)) return "huawei";
  if (/\bAndroid\b/i.test(ua)) return "android";
  if (/\bWindows\b|\bWin(?:32|64)\b/i.test(ua)) return "windows";
  if (/\bMac(?:intosh| OS)\b/i.test(ua)) return "macos";
  if (/\bLinux\b|\bX11\b/i.test(ua)) return "linux";
  return null;
}

/** The client-hints platform token mapped to the closed set, else null. */
function platformFromUaData(value: string | null | undefined): DownloadPlatform | null {
  const token = (value ?? "").trim().toLowerCase();
  switch (token) {
    case "ios":
      return "ios";
    case "android":
      return "android";
    case "macos":
      return "macos";
    case "windows":
      return "windows";
    case "linux":
      return "linux";
    default:
      return null;
  }
}

/**
 * The platform this browser is on, read from `navigator` - the client
 * hints first, then the user-agent string - or `null` where there is no
 * navigator (the server) or it says nothing recognisable. Call it AFTER
 * mount: the server has no navigator, and the first client render must
 * agree with the server's markup.
 */
export function detectPlatform(): DownloadPlatform | null {
  const nav = (globalThis as { navigator?: NavigatorWithHints }).navigator;
  if (!nav) return null;
  return detectPlatformFrom({
    uaDataPlatform: nav.userAgentData?.platform ?? null,
    userAgent: nav.userAgent ?? null,
  });
}

/** `navigator` with the client-hints field browsers that have it expose. */
interface NavigatorWithHints {
  userAgent?: string;
  userAgentData?: { platform?: string } | null;
}

/**
 * The platforms whose download serves a visitor on `platform`, in the
 * order tried: its own first, then the one that also runs its apps - a
 * Huawei phone runs Android builds and an Android phone can install from
 * AppGallery. The desktops and iOS take only their own; a visitor on no
 * recognised platform, or on the web, is offered nothing here (the
 * install prompt is the fallback).
 */
export const DOWNLOAD_FALLBACKS: Readonly<Record<DownloadPlatform, readonly DownloadPlatform[]>> = {
  ios: ["ios"],
  android: ["android", "huawei"],
  huawei: ["huawei", "android"],
  macos: ["macos"],
  windows: ["windows"],
  linux: ["linux"],
  web: [],
};

/**
 * The first entry that serves `platform` ([DOWNLOAD_FALLBACKS], in
 * order), or `null` with none declared for it or no platform known.
 */
export function pickDownload(
  entries: readonly DownloadEntry[],
  platform: DownloadPlatform | null,
): DownloadEntry | null {
  if (!platform) return null;
  for (const wanted of DOWNLOAD_FALLBACKS[platform]) {
    const match = entries.find((entry) => entry.platform === wanted);
    if (match) return match;
  }
  return null;
}

/** The words the offer puts on screen. Override either per product. */
export interface InstallOfferLabels {
  /** Before the entry's label: "Get the" + "Android app". */
  get: string;
  /** The browser-prompt button's word. */
  install: string;
}

export const INSTALL_OFFER_LABELS: InstallOfferLabels = {
  get: "Get the",
  install: "Install",
};

/** "Get the <label>": the offer's text for a picked entry. */
export function installOfferText(
  entry: DownloadEntry,
  labels: Partial<InstallOfferLabels> = {},
): string {
  const get = (labels.get ?? INSTALL_OFFER_LABELS.get).trim();
  return get.length > 0 ? `${get} ${entry.label}` : entry.label;
}

/** The media query a page installed to the home screen matches. */
export const STANDALONE_MEDIA_QUERY = "(display-mode: standalone)";
