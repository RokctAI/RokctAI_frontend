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

// Site shots (base_sdk 1.55.0): pictures of a site's own first screen,
// taken by the shell repo's "Site shots" workflow from the latest build of
// main that passed its health gate, and committed to the repo's orphan
// `site-shots` branch:
//
//   manifest.json                 this module's SiteShotsManifest
//   shots/<commit>/<file>.webp    the six files in SITE_SHOT_FILES
//
// Every site serves its own set at /site-shots/<file> (app/site-shots/
// [file]/route.ts), so the studio (hosting_sdk) asks each client's live
// site for its pictures rather than GitHub.
//
// The pure half: the file list, where the branch is, which repo a shell is,
// and the checks a manifest and an image must pass before anything is
// served. No Next import, so the route, hosting_sdk's studio route and
// tests/site-shots.test.mts reach the same answer.

import { createHash } from "node:crypto";

/** The orphan branch the workflow commits to. */
export const SITE_SHOTS_BRANCH = "site-shots";

/** The manifest's file name, on the branch and under /site-shots/. */
export const SITE_SHOTS_MANIFEST = "manifest.json";

/** How often a cached copy is checked against the source (seconds). */
export const SITE_SHOTS_REVALIDATE_SECONDS = 3600;

/** No shot this size or bigger is accepted. */
export const SITE_SHOTS_MAX_BYTES = 1_500_000;

/** Where raw branch files are read from unless SITE_SHOTS_RAW_ORIGIN says otherwise. */
export const SITE_SHOTS_RAW_ORIGIN = "https://raw.githubusercontent.com";

/**
 * The six pictures, with the size each must be:
 * - desktop: the first 1440 x 1000 of the page, at 1200 x 833;
 * - option: the first 1440 x 900, at 800 x 500 (a design-option thumbnail);
 * - phone: the first 390 x 800 at 2x, at 560 x 1149.
 * Each in the light and the dark theme.
 */
export const SITE_SHOT_FILES = {
  "desktop-light.webp": { width: 1200, height: 833 },
  "desktop-dark.webp": { width: 1200, height: 833 },
  "option-light.webp": { width: 800, height: 500 },
  "option-dark.webp": { width: 800, height: 500 },
  "phone-light.webp": { width: 560, height: 1149 },
  "phone-dark.webp": { width: 560, height: 1149 },
} as const;

export type SiteShotFile = keyof typeof SITE_SHOT_FILES;

export interface SiteShotEntry {
  width: number;
  height: number;
  bytes: number;
  sha256: string;
}

export interface SiteShotsManifest {
  schema: 1;
  /** owner/name of the shell repo the pictures are of. */
  repo: string;
  /** The shell commit that was built and photographed. */
  commit: string;
  /** When, as an ISO 8601 UTC time. */
  taken_at: string;
  /** Where the files sit on the branch: always `shots/<commit>`. */
  dir: string;
  files: Record<SiteShotFile, SiteShotEntry>;
}

export type Checked<T> = { ok: true; value: T } | { ok: false; reason: string };

const REPO_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;
const SHA1_RE = /^[0-9a-f]{40}$/;
const SHA256_RE = /^[0-9a-f]{64}$/;

export function isSiteShotFile(name: string): name is SiteShotFile {
  return Object.prototype.hasOwnProperty.call(SITE_SHOT_FILES, name);
}

/** Every path a site serves under /site-shots/. */
export function siteShotPaths(): string[] {
  return [SITE_SHOTS_MANIFEST, ...Object.keys(SITE_SHOT_FILES)];
}

/**
 * The shell's own repo: SITE_SHOTS_REPO when set, else the repo Vercel
 * built from (VERCEL_GIT_REPO_OWNER / VERCEL_GIT_REPO_SLUG). Null when
 * neither names a well-formed owner/name.
 */
export function resolveSiteShotsRepo(env: Record<string, string | undefined>): string | null {
  const explicit = env.SITE_SHOTS_REPO?.trim();
  const vercel =
    env.VERCEL_GIT_REPO_OWNER?.trim() && env.VERCEL_GIT_REPO_SLUG?.trim()
      ? `${env.VERCEL_GIT_REPO_OWNER.trim()}/${env.VERCEL_GIT_REPO_SLUG.trim()}`
      : "";
  const repo = explicit || vercel;
  return REPO_RE.test(repo) ? repo : null;
}

/** The raw URL of a path on a repo's site-shots branch. */
export function siteShotsRawUrl(repo: string, path: string, origin: string = SITE_SHOTS_RAW_ORIGIN): string {
  return `${origin.replace(/\/+$/, "")}/${repo}/${SITE_SHOTS_BRANCH}/${path}`;
}

/**
 * A manifest is used only when every field is what the workflow writes:
 * schema 1, the expected repo (when one is given), a full commit, a time,
 * `dir` equal to `shots/<commit>`, and all six files at their sizes.
 */
export function parseSiteShotsManifest(input: unknown, expectRepo?: string | null): Checked<SiteShotsManifest> {
  if (!input || typeof input !== "object") return { ok: false, reason: "not an object" };
  const m = input as Record<string, unknown>;
  if (m.schema !== 1) return { ok: false, reason: "schema is not 1" };
  if (typeof m.repo !== "string" || !REPO_RE.test(m.repo)) return { ok: false, reason: "repo" };
  if (expectRepo && m.repo.toLowerCase() !== expectRepo.toLowerCase()) {
    return { ok: false, reason: `repo is ${m.repo}, not ${expectRepo}` };
  }
  if (typeof m.commit !== "string" || !SHA1_RE.test(m.commit)) return { ok: false, reason: "commit" };
  if (typeof m.taken_at !== "string" || Number.isNaN(Date.parse(m.taken_at))) {
    return { ok: false, reason: "taken_at" };
  }
  if (m.dir !== `shots/${m.commit}`) return { ok: false, reason: "dir" };
  if (!m.files || typeof m.files !== "object") return { ok: false, reason: "files" };
  const files = m.files as Record<string, unknown>;
  const out = {} as Record<SiteShotFile, SiteShotEntry>;
  for (const [name, size] of Object.entries(SITE_SHOT_FILES) as [SiteShotFile, { width: number; height: number }][]) {
    const e = files[name] as Record<string, unknown> | undefined;
    if (!e || typeof e !== "object") return { ok: false, reason: `missing ${name}` };
    if (e.width !== size.width || e.height !== size.height) return { ok: false, reason: `${name} size` };
    if (typeof e.bytes !== "number" || e.bytes <= 0 || e.bytes >= SITE_SHOTS_MAX_BYTES) {
      return { ok: false, reason: `${name} bytes` };
    }
    if (typeof e.sha256 !== "string" || !SHA256_RE.test(e.sha256)) return { ok: false, reason: `${name} sha256` };
    out[name] = { width: e.width, height: e.height, bytes: e.bytes, sha256: e.sha256 };
  }
  return {
    ok: true,
    value: { schema: 1, repo: m.repo, commit: m.commit, taken_at: m.taken_at, dir: m.dir, files: out },
  };
}

/** A WebP's pixel size from its header (VP8, VP8L or VP8X), or null. */
export function webpSize(b: Uint8Array): { width: number; height: number } | null {
  const ascii = (o: number, n: number) => String.fromCharCode(...b.subarray(o, o + n));
  if (b.length < 30 || ascii(0, 4) !== "RIFF" || ascii(8, 4) !== "WEBP") return null;
  const chunk = ascii(12, 4);
  if (chunk === "VP8X") {
    return {
      width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)),
      height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)),
    };
  }
  if (chunk === "VP8 ") {
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;
    return { width: (b[26] | (b[27] << 8)) & 0x3fff, height: (b[28] | (b[29] << 8)) & 0x3fff };
  }
  if (chunk === "VP8L") {
    if (b[20] !== 0x2f) return null;
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  return null;
}

export function sha256Hex(b: Uint8Array): string {
  return createHash("sha256").update(b).digest("hex");
}

/**
 * An image is served only when it is the file the manifest names: a WebP
 * of the listed size, the listed length and the listed SHA-256.
 */
export function checkSiteShot(file: SiteShotFile, bytes: Uint8Array, manifest: SiteShotsManifest): Checked<Uint8Array> {
  const want = manifest.files[file];
  if (bytes.length !== want.bytes) return { ok: false, reason: `${file}: ${bytes.length} bytes, manifest says ${want.bytes}` };
  const size = webpSize(bytes);
  if (!size) return { ok: false, reason: `${file}: not a WebP` };
  if (size.width !== want.width || size.height !== want.height) {
    return { ok: false, reason: `${file}: ${size.width}x${size.height}, manifest says ${want.width}x${want.height}` };
  }
  if (sha256Hex(bytes) !== want.sha256) return { ok: false, reason: `${file}: sha256 differs from the manifest` };
  return { ok: true, value: bytes };
}

/** The headers a served shot carries: a CDN may hold it for the revalidate window. */
export function siteShotHeaders(contentType: string, commit: string): Record<string, string> {
  return {
    "content-type": contentType,
    "cache-control": `public, max-age=300, s-maxage=${SITE_SHOTS_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    "x-site-shots-commit": commit,
  };
}
