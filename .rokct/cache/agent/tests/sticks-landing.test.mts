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

// agent_sdk 1.25.0: the pure rules behind the Sticks landing - which
// release files the download buttons link, which tour capture each phone
// shows, and the copy helpers. Run by
// tests/test_sticks_landing.py against staged copies of the modules.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  STICKS_RELEASES_PAGE,
  TOUR_FALLBACK,
  missingDarkScreens,
  pickDownloads,
  tourScreen,
  tourScreenFiles,
  tourScreenUrl,
} from './sticks-sources.ts';
import { STICKS_ASK, STICKS_BETWEEN, STICKS_DOWNLOAD, STICKS_GALLERY, STICKS_MEET, feedTime, fill } from './sticks-landing-config.ts';

const DL = 'https://github.com/RokctAI/sticks/releases/download/v1.2.12/';
const RELEASE = {
  tag_name: 'v1.2.12',
  html_url: 'https://github.com/RokctAI/sticks/releases/tag/v1.2.12',
  assets: [
    { name: 'app-debug-v1.2.12.apk', browser_download_url: DL + 'app-debug-v1.2.12.apk', size: 90000000 },
    { name: 'app-v1.2.12.aab', browser_download_url: DL + 'app-v1.2.12.aab' },
    { name: 'app-v1.2.12.apk', browser_download_url: DL + 'app-v1.2.12.apk', size: 31457280 },
    { name: 'sticks-windows-setup-v1.2.12.exe', browser_download_url: DL + 'sticks-windows-setup-v1.2.12.exe' },
    { name: 'update_package.zip', browser_download_url: DL + 'update_package.zip' },
  ],
};

describe('pickDownloads: the newest release, never an invented link', () => {
  it('links the release APK (not the debug one) and the Windows installer', () => {
    const d = pickDownloads(RELEASE);
    assert.equal(d.state, 'ready');
    assert.equal(d.version, 'v1.2.12');
    assert.equal(d.android?.url, DL + 'app-v1.2.12.apk');
    assert.equal(d.android?.sizeMb, 30);
    assert.equal(d.windows?.url, DL + 'sticks-windows-setup-v1.2.12.exe');
    assert.equal(d.windows?.sizeMb, null);
  });

  it('leaves out a platform the release does not carry', () => {
    const d = pickDownloads({ ...RELEASE, assets: RELEASE.assets.filter((a) => !a.name.endsWith('.exe')) });
    assert.equal(d.state, 'ready');
    assert.ok(d.android);
    assert.equal(d.windows, null);
  });

  it('is "coming soon" with no release, a draft, or no matching file', () => {
    assert.equal(pickDownloads(null).state, 'none');
    assert.equal(pickDownloads({ ...RELEASE, draft: true }).state, 'none');
    const debugOnly = pickDownloads({ ...RELEASE, assets: [RELEASE.assets[0]] });
    assert.equal(debugOnly.state, 'none');
    assert.equal(debugOnly.android, null);
  });

  it('opens the releases page when GitHub could not be asked', () => {
    const d = pickDownloads(undefined);
    assert.equal(d.state, 'unknown');
    assert.equal(d.releaseUrl, STICKS_RELEASES_PAGE + '/latest');
    assert.equal(d.android, null);
  });

  it('refuses a download URL off github.com', () => {
    const d = pickDownloads({ assets: [{ name: 'app-v1.0.0.apk', browser_download_url: 'https://evil.example/app-v1.0.0.apk' }] });
    assert.equal(d.state, 'none');
  });
});

describe('tour screens: matched by step id, light and dark', () => {
  const listing = [
    { name: '01-welcome.png' },
    { name: '06-sticks_stick.png' },
    { name: '12-sticks_hire.png' },
    { name: 'README.md' },
  ];

  it('maps each step id to the file the listing names today', () => {
    const files = tourScreenFiles(listing);
    assert.deepEqual(files, { welcome: '01-welcome.png', sticks_stick: '06-sticks_stick.png', sticks_hire: '12-sticks_hire.png' });
    assert.match(tourScreenUrl('sticks_stick', files) ?? '', /\/marketing\/tour\/screenshots\/06-sticks_stick\.png$/);
    assert.deepEqual(tourScreenFiles({ message: 'rate limited' }), {});
  });

  it('falls back to the last known file name, and knows no unknown step', () => {
    assert.match(tourScreenUrl('sticks_ask') ?? '', /\/09-sticks_ask\.png$/);
    assert.equal(tourScreenUrl('no_such_step'), null);
  });

  it('answers a dark capture only when the dark listing has it', () => {
    const files = { light: tourScreenFiles(listing), dark: tourScreenFiles([{ name: '06-sticks_stick.png' }]) };
    assert.match(tourScreen('sticks_stick', files).dark ?? '', /\/screenshots-dark\/06-sticks_stick\.png$/);
    assert.equal(tourScreen('sticks_hire', files).dark, null);
    assert.deepEqual(missingDarkScreens(['sticks_stick', 'sticks_hire'], files), ['sticks_hire']);
  });

  it('takes a render from the one screens map when a step has one', () => {
    const renders = { sticks_hire: { light: '/screens/hire.svg' } };
    assert.deepEqual(tourScreen('sticks_hire', { light: {}, dark: {} }, renders), { light: '/screens/hire.svg', dark: null });
    assert.match(tourScreen('sticks_ask', { light: {}, dark: {} }, renders).light ?? '', /09-sticks_ask\.png$/);
  });

  it('every screen the page shows is a known tour step', () => {
    const steps = [
      STICKS_MEET.screen.step,
      ...STICKS_ASK.screens.map((s) => s.step),
      ...STICKS_BETWEEN.screens.map((s) => s.step),
      ...STICKS_GALLERY.screens.map((s) => s.step),
    ];
    for (const step of steps) assert.ok(step in TOUR_FALLBACK, step);
    assert.equal(new Set(steps).size, steps.length, 'no screen is shown twice');
    // The concept: Meet your Sticks shows the Hire a Stick screen beside
    // the New hire card, and the gallery keeps One Stick (Ray: "like this").
    assert.equal(STICKS_MEET.screen.step, 'sticks_hire');
    assert.ok(STICKS_GALLERY.screens.some((s) => s.step === 'sticks_stick'));
  });
});

describe('copy helpers', () => {
  it('formats the feed clock and fills placeholders', () => {
    assert.equal(feedTime(9 * 60 + 12), '09:12');
    assert.equal(feedTime(24 * 60 + 5), '00:05');
    assert.equal(fill('Free · {version}', { version: 'v1.2.12' }), 'Free · v1.2.12');
    assert.equal(fill('{missing}', {}), '{missing}');
  });

  it('words the downloads as the concept does', () => {
    assert.equal(STICKS_ASK.screens.length, 2);
    assert.equal(fill(STICKS_DOWNLOAD.note, { version: 'v1.2.12' }), 'Free from GitHub');
    assert.equal(STICKS_DOWNLOAD.platforms, 'Android phones and Windows PCs');
  });
});
