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

// The download rules (since 1.41.0), the pure half of the footer's
// download buttons (Ray, 2026-09-11: "footer has  download links let them
// be platform icons buttons"). components/custom/footer-chrome.tsx draws
// the buttons; this module says which entries are drawable. Nothing here
// names a store, a platform's wording or a host: the platforms are a
// closed set of keys, the href rule is "https, or a route of the shell's
// own", and every word on screen arrives on the entry.

import type {
  DownloadEntry,
  DownloadPlatform,
} from "@/components/custom/landing/footer-chrome-config";

/** Every platform an entry may name, in the order the buttons draw them. */
export const DOWNLOAD_PLATFORMS: readonly DownloadPlatform[] = [
  "ios",
  "android",
  "huawei",
  "macos",
  "windows",
  "linux",
  "web",
];

/** Whether `value` is one of [DOWNLOAD_PLATFORMS]. */
export function isDownloadPlatform(value: unknown): value is DownloadPlatform {
  return typeof value === "string" && (DOWNLOAD_PLATFORMS as readonly string[]).includes(value);
}

/**
 * Whether `href` is somewhere a download button may point: an `https:`
 * URL with a host, or a route of the shell's own - a path starting with
 * ONE slash (`//host` is a scheme-relative URL, not a route). Nothing
 * else: no `http:`, no `javascript:`, no `data:`, no bare word.
 */
export function isDownloadHref(href: unknown): href is string {
  if (typeof href !== "string") return false;
  const trimmed = href.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.startsWith("/")) return !trimmed.startsWith("//");
  if (!/^https:\/\//i.test(trimmed)) return false;
  try {
    return new URL(trimmed).hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * Whether `value` is a drawable [DownloadEntry]: an object with a
 * non-empty `id` and `label`, a platform from the closed set and an href
 * [isDownloadHref] accepts; `external`, `title` and `mark`, when present,
 * of their declared types. The mark's NAME is checked by the button
 * against BRAND_MARKS at render time, not here, so this module stays free
 * of the registry.
 */
export function isDownloadEntry(value: unknown): value is DownloadEntry {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  if (typeof entry.id !== "string" || entry.id.trim().length === 0) return false;
  if (typeof entry.label !== "string" || entry.label.trim().length === 0) return false;
  if (!isDownloadPlatform(entry.platform)) return false;
  if (!isDownloadHref(entry.href)) return false;
  if (entry.external !== undefined && typeof entry.external !== "boolean") return false;
  if (entry.title !== undefined && typeof entry.title !== "string") return false;
  if (entry.mark !== undefined && typeof entry.mark !== "string") return false;
  return true;
}

/**
 * The entries a row draws, from whatever a config declared: the drawable
 * ones ([isDownloadEntry]), in the order declared, the first of any two
 * with the same `id` kept. `null`, `undefined` and a non-array are no
 * entries, so a footer with nothing declared draws nothing.
 */
export function normaliseDownloads(value: unknown): DownloadEntry[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const entries: DownloadEntry[] = [];
  for (const candidate of value) {
    if (!isDownloadEntry(candidate)) continue;
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    entries.push(candidate);
  }
  return entries;
}

/** The title a download button carries: its own `title`, else its label. */
export function downloadTitle(entry: DownloadEntry): string {
  const title = entry.title?.trim();
  return title && title.length > 0 ? title : entry.label;
}
