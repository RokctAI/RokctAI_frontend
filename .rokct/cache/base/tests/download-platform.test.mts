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

// base_sdk 1.41.0: the footer's download entries (Ray, 2026-09-11:
// "footer has  download links let them be platform icons buttons"). Run
// by tests/test_manifest.py against a staged copy of
// components/custom/landing/download-platform.ts beside
// footer-chrome-config.ts, under node's own test runner with type
// stripping. Every entry below is this file's own fixture: no product, no
// real host, no store URL.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DOWNLOAD_PLATFORMS,
  downloadTitle,
  isDownloadEntry,
  isDownloadHref,
  isDownloadPlatform,
  normaliseDownloads,
} from './download-platform.ts';
import type { DownloadEntry } from './footer-chrome-config.ts';

const ANDROID: DownloadEntry = {
  id: 'android',
  platform: 'android',
  label: 'Android app',
  href: 'https://store.example.app/listing',
  external: true,
  mark: 'googlePlay',
};
const WEB: DownloadEntry = { id: 'web', platform: 'web', label: 'Web app', href: '/app' };

describe('the platform set', () => {
  it('is the seven platforms, in drawing order, and nothing else', () => {
    assert.deepEqual([...DOWNLOAD_PLATFORMS], ['ios', 'android', 'huawei', 'macos', 'windows', 'linux', 'web']);
    for (const platform of DOWNLOAD_PLATFORMS) assert.equal(isDownloadPlatform(platform), true);
    for (const wrong of ['IOS', 'iphone', 'chrome', '', null, undefined, 3, {}]) {
      assert.equal(isDownloadPlatform(wrong), false, String(wrong));
    }
  });
});

describe('isDownloadHref: https, or a route of the shell', () => {
  it('accepts an https URL with a host and a route with one leading slash', () => {
    assert.equal(isDownloadHref('https://store.example.app/listing?id=1'), true);
    assert.equal(isDownloadHref('HTTPS://store.example.app'), true);
    assert.equal(isDownloadHref('/download'), true);
    assert.equal(isDownloadHref('/'), true);
    assert.equal(isDownloadHref(' /app '), true);
  });

  it('refuses http, other schemes, a scheme-relative URL, a bare word and no string', () => {
    for (const wrong of [
      'http://store.example.app',
      'javascript:alert(1)',
      'data:text/plain,hi',
      'mailto:someone',
      '//store.example.app',
      'https://',
      'download',
      '',
      '   ',
      null,
      undefined,
      42,
    ]) {
      assert.equal(isDownloadHref(wrong), false, String(wrong));
    }
  });
});

describe('isDownloadEntry: the drawable shape', () => {
  it('accepts an entry with id, label, a known platform and an accepted href; the extras optional', () => {
    assert.equal(isDownloadEntry(ANDROID), true);
    assert.equal(isDownloadEntry(WEB), true);
    assert.equal(isDownloadEntry({ ...WEB, title: 'Open in the browser', external: false }), true);
  });

  it('refuses a missing or empty id or label, an unknown platform, a bad href and mistyped extras', () => {
    assert.equal(isDownloadEntry({ ...ANDROID, id: '' }), false);
    assert.equal(isDownloadEntry({ ...ANDROID, id: ' ' }), false);
    assert.equal(isDownloadEntry({ ...ANDROID, label: '' }), false);
    assert.equal(isDownloadEntry({ ...ANDROID, platform: 'bsd' }), false);
    assert.equal(isDownloadEntry({ ...ANDROID, platform: undefined }), false);
    assert.equal(isDownloadEntry({ ...ANDROID, href: 'http://store.example.app' }), false);
    assert.equal(isDownloadEntry({ ...ANDROID, href: '//store.example.app' }), false);
    assert.equal(isDownloadEntry({ ...ANDROID, external: 'yes' }), false);
    assert.equal(isDownloadEntry({ ...ANDROID, title: 3 }), false);
    assert.equal(isDownloadEntry({ ...ANDROID, mark: {} }), false);
    for (const wrong of [null, undefined, 'android', 7, [], [ANDROID]]) {
      assert.equal(isDownloadEntry(wrong), false, String(wrong));
    }
  });
});

describe('normaliseDownloads: what the row draws', () => {
  it('nothing declared, or not a list, is no entry', () => {
    assert.deepEqual(normaliseDownloads(undefined), []);
    assert.deepEqual(normaliseDownloads(null), []);
    assert.deepEqual(normaliseDownloads({}), []);
    assert.deepEqual(normaliseDownloads('android'), []);
    assert.deepEqual(normaliseDownloads([]), []);
  });

  it('keeps the drawable entries in declared order and drops the rest', () => {
    const bad = { id: 'bad', platform: 'bsd', label: 'Nope', href: '/x' };
    assert.deepEqual(normaliseDownloads([bad, ANDROID, null, WEB, 'x']), [ANDROID, WEB]);
  });

  it('keeps the first of two entries with the same id', () => {
    const twin: DownloadEntry = { ...WEB, label: 'Second' };
    assert.deepEqual(normaliseDownloads([WEB, twin, ANDROID]), [WEB, ANDROID]);
  });
});

describe('downloadTitle', () => {
  it('is the title when one is set, else the label', () => {
    assert.equal(downloadTitle(ANDROID), 'Android app');
    assert.equal(downloadTitle({ ...ANDROID, title: 'On the Play store' }), 'On the Play store');
    assert.equal(downloadTitle({ ...ANDROID, title: '  ' }), 'Android app');
  });
});
