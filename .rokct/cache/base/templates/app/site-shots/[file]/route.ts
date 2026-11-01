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

// /site-shots/manifest.json and /site-shots/<file>.webp (base_sdk 1.55.0):
// this site's own pictures of its first screen, read from the shell repo's
// `site-shots` branch (see components/custom/landing/site-shots.ts).
//
// Each path is a static route regenerated at most hourly (incremental
// static regeneration). A regeneration that fails - the branch is
// unreachable, the manifest is malformed or names another repo, an image
// does not match its manifest entry - THROWS, and Next keeps serving the
// last response it generated, so a bad or missing source never replaces a
// good picture. At build time a failure answers 404 instead (nothing good
// exists yet), which the next regeneration replaces once the source is
// readable.
//
// The repo is SITE_SHOTS_REPO, else the one Vercel built from.
// SITE_SHOTS_RAW_ORIGIN replaces https://raw.githubusercontent.com (tests).

import {
  SITE_SHOTS_MANIFEST,
  SITE_SHOTS_RAW_ORIGIN,
  SITE_SHOTS_REVALIDATE_SECONDS,
  checkSiteShot,
  isSiteShotFile,
  parseSiteShotsManifest,
  resolveSiteShotsRepo,
  siteShotHeaders,
  siteShotPaths,
  siteShotsRawUrl,
} from "@/components/custom/landing/site-shots";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return siteShotPaths().map((file) => ({ file }));
}

async function readRaw(repo: string, path: string): Promise<Uint8Array> {
  const origin = process.env.SITE_SHOTS_RAW_ORIGIN?.trim() || SITE_SHOTS_RAW_ORIGIN;
  const res = await fetch(siteShotsRawUrl(repo, path, origin), {
    next: { revalidate: SITE_SHOTS_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`site-shots: ${path} answered ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function build(file: string): Promise<Response> {
  const repo = resolveSiteShotsRepo(process.env);
  if (!repo) throw new Error("site-shots: no repo (set SITE_SHOTS_REPO)");
  const raw = await readRaw(repo, SITE_SHOTS_MANIFEST);
  const parsed = parseSiteShotsManifest(JSON.parse(new TextDecoder().decode(raw)), repo);
  if (!parsed.ok) throw new Error(`site-shots: manifest rejected (${parsed.reason})`);
  const manifest = parsed.value;
  if (file === SITE_SHOTS_MANIFEST) {
    return new Response(JSON.stringify(manifest), {
      headers: siteShotHeaders("application/json; charset=utf-8", manifest.commit),
    });
  }
  if (!isSiteShotFile(file)) throw new Error(`site-shots: ${file} is not a shot`);
  const checked = checkSiteShot(file, await readRaw(repo, `${manifest.dir}/${file}`), manifest);
  if (!checked.ok) throw new Error(`site-shots: ${checked.reason}`);
  return new Response(checked.value as BodyInit, { headers: siteShotHeaders("image/webp", manifest.commit) });
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  try {
    return await build(file);
  } catch (error) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn(`${error instanceof Error ? error.message : error}; /site-shots/${file} answers 404 until a regeneration succeeds`);
      return new Response("No site shots yet", { status: 404, headers: { "cache-control": "no-store" } });
    }
    // Next keeps the last response it generated for this path.
    throw error;
  }
}
