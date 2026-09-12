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

// base_sdk 1.41.0: the install offer's rules (Ray, 2026-09-11: "this
// nextjs has install, it does show on mobile though i havent seen it in
// desktop i think it installs as pwa but i think it should check the
// platform and offer app of that platform"). Run by tests/test_manifest.py
// against a staged copy of components/custom/landing/install-offer.ts
// beside footer-chrome-config.ts, under node's own test runner with type
// stripping. The user-agent strings below are the shapes browsers send,
// with no real product in them; the entries are this file's fixture.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DOWNLOAD_FALLBACKS,
  INSTALL_OFFER_LABELS,
  STANDALONE_MEDIA_QUERY,
  detectPlatform,
  detectPlatformFrom,
  installOfferText,
  pickDownload,
} from './install-offer.ts';
import type { DownloadEntry, DownloadPlatform } from './footer-chrome-config.ts';

const UA = {
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
  huaweiAndroid: 'Mozilla/5.0 (Linux; Android 10; HUAWEI P40) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
  harmony: 'Mozilla/5.0 (Phone; OpenHarmony 4.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 HarmonyOS Mobile Safari/537.36',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  linuxFirefox: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
  bot: 'SomeCrawler/1.0 (+contact)',
};

describe('detectPlatformFrom: the user-agent string', () => {
  it('maps each family, narrower tokens before the broader ones they contain', () => {
    assert.equal(detectPlatformFrom({ userAgent: UA.iphone }), 'ios');
    assert.equal(detectPlatformFrom({ userAgent: UA.ipad }), 'ios', 'an iPad says "like Mac OS X"');
    assert.equal(detectPlatformFrom({ userAgent: UA.android }), 'android', 'an Android says "Linux"');
    assert.equal(detectPlatformFrom({ userAgent: UA.huaweiAndroid }), 'huawei', 'a HUAWEI says "Android"');
    assert.equal(detectPlatformFrom({ userAgent: UA.harmony }), 'huawei');
    assert.equal(detectPlatformFrom({ userAgent: UA.mac }), 'macos');
    assert.equal(detectPlatformFrom({ userAgent: UA.windows }), 'windows');
    assert.equal(detectPlatformFrom({ userAgent: UA.linux }), 'linux');
    assert.equal(detectPlatformFrom({ userAgent: UA.linuxFirefox }), 'linux');
  });

  it('answers null for nothing recognisable, an empty string, or no hints at all', () => {
    assert.equal(detectPlatformFrom({ userAgent: UA.bot }), null);
    assert.equal(detectPlatformFrom({ userAgent: '' }), null);
    assert.equal(detectPlatformFrom({ userAgent: null }), null);
    assert.equal(detectPlatformFrom({}), null);
  });
});

describe('detectPlatformFrom: the client hints come first', () => {
  it('reads navigator.userAgentData.platform before the string, case-insensitively', () => {
    assert.equal(detectPlatformFrom({ uaDataPlatform: 'Windows', userAgent: UA.linux }), 'windows');
    assert.equal(detectPlatformFrom({ uaDataPlatform: 'macOS', userAgent: UA.windows }), 'macos');
    assert.equal(detectPlatformFrom({ uaDataPlatform: 'Android' }), 'android');
    assert.equal(detectPlatformFrom({ uaDataPlatform: 'iOS' }), 'ios');
    assert.equal(detectPlatformFrom({ uaDataPlatform: 'linux' }), 'linux');
  });

  it('falls through to the string for a token outside the set', () => {
    assert.equal(detectPlatformFrom({ uaDataPlatform: 'Chrome OS', userAgent: UA.linux }), 'linux');
    assert.equal(detectPlatformFrom({ uaDataPlatform: 'Unknown', userAgent: UA.iphone }), 'ios');
    assert.equal(detectPlatformFrom({ uaDataPlatform: '', userAgent: UA.mac }), 'macos');
    assert.equal(detectPlatformFrom({ uaDataPlatform: 'Unknown' }), null);
  });
});

describe('detectPlatform: reads navigator, and is null without one', () => {
  it('is null on the server (no navigator)', () => {
    const g = globalThis as { navigator?: unknown };
    const saved = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    Object.defineProperty(globalThis, 'navigator', { value: undefined, configurable: true, writable: true });
    try {
      assert.equal(detectPlatform(), null);
    } finally {
      if (saved) Object.defineProperty(globalThis, 'navigator', saved);
      else delete g.navigator;
    }
  });

  it('reads the hints, then the string, from a navigator', () => {
    const saved = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    const set = (value: unknown) =>
      Object.defineProperty(globalThis, 'navigator', { value, configurable: true, writable: true });
    try {
      set({ userAgent: UA.android });
      assert.equal(detectPlatform(), 'android');
      set({ userAgent: UA.android, userAgentData: { platform: 'Windows' } });
      assert.equal(detectPlatform(), 'windows');
      set({ userAgent: UA.bot, userAgentData: null });
      assert.equal(detectPlatform(), null);
    } finally {
      if (saved) Object.defineProperty(globalThis, 'navigator', saved);
      else delete (globalThis as { navigator?: unknown }).navigator;
    }
  });
});

const entry = (platform: DownloadPlatform, id = platform): DownloadEntry => ({
  id,
  platform,
  label: `${platform} app`,
  href: `/get/${platform}`,
});
const ALL: DownloadEntry[] = ['ios', 'android', 'huawei', 'macos', 'windows', 'linux', 'web'].map((p) =>
  entry(p as DownloadPlatform),
);

describe('pickDownload: the entry for the platform', () => {
  it('takes its own platform first', () => {
    for (const platform of ['ios', 'android', 'huawei', 'macos', 'windows', 'linux'] as const) {
      assert.equal(pickDownload(ALL, platform)?.id, platform);
    }
  });

  it('android and huawei stand in for each other, in that order', () => {
    assert.deepEqual([...DOWNLOAD_FALLBACKS.android], ['android', 'huawei']);
    assert.deepEqual([...DOWNLOAD_FALLBACKS.huawei], ['huawei', 'android']);
    assert.equal(pickDownload([entry('huawei')], 'android')?.id, 'huawei');
    assert.equal(pickDownload([entry('android')], 'huawei')?.id, 'android');
    assert.equal(pickDownload([entry('huawei'), entry('android')], 'android')?.id, 'android');
  });

  it('the desktops and ios take only their own', () => {
    assert.equal(pickDownload([entry('windows'), entry('linux')], 'macos'), null);
    assert.equal(pickDownload([entry('macos'), entry('linux')], 'windows'), null);
    assert.equal(pickDownload([entry('macos'), entry('windows')], 'linux'), null);
    assert.equal(pickDownload([entry('android'), entry('macos')], 'ios'), null);
  });

  it('is null with no platform, no entries, or the web alone', () => {
    assert.equal(pickDownload(ALL, null), null);
    assert.equal(pickDownload([], 'android'), null);
    assert.equal(pickDownload([entry('web')], 'android'), null);
    assert.equal(pickDownload(ALL, 'web'), null, 'a web visitor is offered the install prompt, not a link');
  });

  it('takes the first declared of several for the same platform', () => {
    assert.equal(pickDownload([entry('android', 'first'), entry('android', 'second')], 'android')?.id, 'first');
  });
});

describe('the words', () => {
  it('"Get the <label>" by default, the prefix overridable, and "Install" for the prompt', () => {
    assert.deepEqual(INSTALL_OFFER_LABELS, { get: 'Get the', install: 'Install' });
    assert.equal(installOfferText(entry('android')), 'Get the android app');
    assert.equal(installOfferText(entry('android'), { get: 'Download the' }), 'Download the android app');
    assert.equal(installOfferText(entry('android'), { get: '' }), 'android app');
  });

  it('hides on an installed page by the standalone display mode', () => {
    assert.equal(STANDALONE_MEDIA_QUERY, '(display-mode: standalone)');
  });
});
