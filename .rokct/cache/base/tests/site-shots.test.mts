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

// base_sdk 1.55.0: the site-shots rules (components/custom/landing/
// site-shots.ts). Run by tests/test_manifest.py against a staged copy
// under node's own test runner with type stripping: which repo a shell is,
// where the branch is, and what a manifest and an image must be before
// either is served.

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import {
  SITE_SHOT_FILES,
  SITE_SHOTS_BRANCH,
  SITE_SHOTS_MANIFEST,
  checkSiteShot,
  isSiteShotFile,
  parseSiteShotsManifest,
  resolveSiteShotsRepo,
  siteShotHeaders,
  siteShotPaths,
  siteShotsRawUrl,
  webpSize,
} from './site-shots.ts';

const COMMIT = 'a'.repeat(40);

// A lossless WebP header (VP8L) of the given size, padded to `length`.
function vp8l(width: number, height: number, length = 64): Uint8Array {
  const b = new Uint8Array(length);
  b.set([0x52, 0x49, 0x46, 0x46], 0);
  new DataView(b.buffer).setUint32(4, length - 8, true);
  b.set([0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x4c], 8);
  new DataView(b.buffer).setUint32(16, length - 20, true);
  b[20] = 0x2f;
  const bits = ((width - 1) & 0x3fff) | (((height - 1) & 0x3fff) << 14);
  new DataView(b.buffer).setUint32(21, bits >>> 0, true);
  return b;
}

// An extended WebP header (VP8X).
function vp8x(width: number, height: number): Uint8Array {
  const b = new Uint8Array(40);
  b.set([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x58], 0);
  const w = width - 1;
  const h = height - 1;
  b.set([w & 0xff, (w >> 8) & 0xff, (w >> 16) & 0xff, h & 0xff, (h >> 8) & 0xff, (h >> 16) & 0xff], 24);
  return b;
}

const sha = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');

function images(): Record<string, Uint8Array> {
  return Object.fromEntries(
    Object.entries(SITE_SHOT_FILES).map(([name, s]) => [name, vp8l(s.width, s.height)]),
  );
}

function manifestFor(imgs: Record<string, Uint8Array>, over: Record<string, unknown> = {}) {
  return {
    schema: 1,
    repo: 'RokctAI/polaris-web',
    commit: COMMIT,
    taken_at: '2026-10-31T11:14:12Z',
    dir: `shots/${COMMIT}`,
    files: Object.fromEntries(
      Object.entries(imgs).map(([name, b]) => {
        const s = SITE_SHOT_FILES[name as keyof typeof SITE_SHOT_FILES];
        return [name, { width: s.width, height: s.height, bytes: b.length, sha256: sha(b) }];
      }),
    ),
    ...over,
  };
}

describe('the files and the branch', () => {
  it('lists six pictures at the studio sizes', () => {
    assert.deepEqual(SITE_SHOT_FILES['desktop-dark.webp'], { width: 1200, height: 833 });
    assert.deepEqual(SITE_SHOT_FILES['option-light.webp'], { width: 800, height: 500 });
    assert.deepEqual(SITE_SHOT_FILES['phone-light.webp'], { width: 560, height: 1149 });
    assert.equal(Object.keys(SITE_SHOT_FILES).length, 6);
    assert.deepEqual(siteShotPaths(), [SITE_SHOTS_MANIFEST, ...Object.keys(SITE_SHOT_FILES)]);
    assert.equal(isSiteShotFile('phone-dark.webp'), true);
    assert.equal(isSiteShotFile('../manifest.json'), false);
    assert.equal(isSiteShotFile('constructor'), false);
  });

  it('reads from the site-shots branch on raw.githubusercontent.com', () => {
    assert.equal(SITE_SHOTS_BRANCH, 'site-shots');
    assert.equal(
      siteShotsRawUrl('RokctAI/polaris-web', 'manifest.json'),
      'https://raw.githubusercontent.com/RokctAI/polaris-web/site-shots/manifest.json',
    );
    assert.equal(siteShotsRawUrl('a/b', 'x.webp', 'http://127.0.0.1:8899/'), 'http://127.0.0.1:8899/a/b/site-shots/x.webp');
  });

  it('lets a CDN keep a shot for the revalidate window', () => {
    const h = siteShotHeaders('image/webp', COMMIT);
    assert.equal(h['content-type'], 'image/webp');
    assert.match(h['cache-control'], /s-maxage=3600/);
    assert.equal(h['x-site-shots-commit'], COMMIT);
  });
});

describe('which repo a shell is', () => {
  it('takes SITE_SHOTS_REPO first, then the repo Vercel built from', () => {
    assert.equal(resolveSiteShotsRepo({ SITE_SHOTS_REPO: 'RokctAI/hosting', VERCEL_GIT_REPO_OWNER: 'x', VERCEL_GIT_REPO_SLUG: 'y' }), 'RokctAI/hosting');
    assert.equal(resolveSiteShotsRepo({ VERCEL_GIT_REPO_OWNER: 'RokctAI', VERCEL_GIT_REPO_SLUG: 'supacharge-web' }), 'RokctAI/supacharge-web');
  });
  it('answers null for nothing or a malformed name', () => {
    assert.equal(resolveSiteShotsRepo({}), null);
    assert.equal(resolveSiteShotsRepo({ SITE_SHOTS_REPO: '../etc' }), null);
    assert.equal(resolveSiteShotsRepo({ SITE_SHOTS_REPO: 'a/b/c' }), null);
    assert.equal(resolveSiteShotsRepo({ VERCEL_GIT_REPO_OWNER: 'RokctAI' }), null);
  });
});

describe('the manifest', () => {
  it('accepts what the workflow writes', () => {
    const m = parseSiteShotsManifest(manifestFor(images()), 'rokctai/POLARIS-web');
    assert.equal(m.ok, true);
    if (m.ok) assert.equal(m.value.dir, `shots/${COMMIT}`);
  });
  it('rejects another repo, a short commit, a bad time or a dir off the commit', () => {
    const imgs = images();
    assert.equal(parseSiteShotsManifest(manifestFor(imgs), 'RokctAI/hosting').ok, false);
    assert.equal(parseSiteShotsManifest(manifestFor(imgs, { commit: 'abc' })).ok, false);
    assert.equal(parseSiteShotsManifest(manifestFor(imgs, { taken_at: 'yesterday' })).ok, false);
    assert.equal(parseSiteShotsManifest(manifestFor(imgs, { dir: '../../main' })).ok, false);
    assert.equal(parseSiteShotsManifest(manifestFor(imgs, { schema: 2 })).ok, false);
    assert.equal(parseSiteShotsManifest(null).ok, false);
    assert.equal(parseSiteShotsManifest('<html>404</html>').ok, false);
  });
  it('rejects a missing file, a wrong size, a bad hash or an oversized file', () => {
    const imgs = images();
    const m = manifestFor(imgs) as any;
    const drop = structuredClone(m);
    delete drop.files['phone-dark.webp'];
    assert.equal(parseSiteShotsManifest(drop).ok, false);
    const size = structuredClone(m);
    size.files['option-light.webp'].width = 801;
    assert.equal(parseSiteShotsManifest(size).ok, false);
    const hash = structuredClone(m);
    hash.files['desktop-light.webp'].sha256 = 'nope';
    assert.equal(parseSiteShotsManifest(hash).ok, false);
    const big = structuredClone(m);
    big.files['desktop-light.webp'].bytes = 2_000_000;
    assert.equal(parseSiteShotsManifest(big).ok, false);
  });
});

describe('an image', () => {
  it('reads a WebP size from VP8L and VP8X headers', () => {
    assert.deepEqual(webpSize(vp8l(800, 500)), { width: 800, height: 500 });
    assert.deepEqual(webpSize(vp8x(1200, 833)), { width: 1200, height: 833 });
    assert.equal(webpSize(new TextEncoder().encode('<!doctype html><html>not a picture</html>')), null);
  });
  it('is served only when it is the file the manifest names', () => {
    const imgs = images();
    const parsed = parseSiteShotsManifest(manifestFor(imgs));
    assert.ok(parsed.ok);
    if (!parsed.ok) return;
    const m = parsed.value;
    assert.equal(checkSiteShot('option-dark.webp', imgs['option-dark.webp'], m).ok, true);
    // Another file of the same size and length: the hash catches it.
    const other = vp8l(800, 500);
    other[60] = 1;
    assert.equal(checkSiteShot('option-dark.webp', other, m).ok, false);
    // The wrong picture (a desktop shot where an option belongs).
    assert.equal(checkSiteShot('option-dark.webp', imgs['desktop-dark.webp'], m).ok, false);
    // A page of HTML where a picture belongs.
    assert.equal(checkSiteShot('option-dark.webp', new Uint8Array(64), m).ok, false);
  });
});
