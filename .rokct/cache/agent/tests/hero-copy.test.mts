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
// agent_sdk 1.15.0: the Chrome Web Store mark, served by the shell itself
// (Ray, 2026-09-09: "use it but bring it local"), on the hero's badge and
// the header's extension button. 1.16.0: the files are base_sdk 1.26.0's
// under /brand/marks/, this SDK names them, and the App Store badge draws
// the official file too. Run by tests/test_manifest.py against
// staged copies of components/custom/landing/agent-hero-copy.ts and
// agent-header-menu.ts, with base's hero-config replaced by tests/stubs.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import copy, { APP_STORE_MARK, CHROME_WEB_STORE_MARK, GOOGLE_PLAY_MARK, LOCAL_MARKS, withLocalMarks } from './agent-hero-copy.ts';
import menu from './agent-header-menu.ts';
import { HERO_CONFIG } from './stubs/components/custom/landing/hero-config.ts';

const LOCAL_MARK = { src: '/brand/marks/chrome-web-store.svg', alt: 'Chrome Web Store' };
const PLAY_MARK = { src: '/brand/marks/google-play.svg', alt: 'Google Play' };
const STORE_MARK = { src: '/brand/marks/app-store.svg', alt: 'App Store' };

describe('agent-hero-copy: what rokct.ai lays over base\'s hero', () => {
  it("names base's files for the marks, and nothing on any other host", () => {
    assert.deepEqual(CHROME_WEB_STORE_MARK, LOCAL_MARK);
    assert.deepEqual(GOOGLE_PLAY_MARK, PLAY_MARK);
    assert.deepEqual(APP_STORE_MARK, STORE_MARK);
    assert.deepEqual(LOCAL_MARKS, { chrome: LOCAL_MARK, 'google-play': PLAY_MARK, 'app-store': STORE_MARK });
    assert.ok(!JSON.stringify(LOCAL_MARKS).includes('http'));
    // Every mark is a path under /brand/marks/, the files base_sdk 1.26.0
    // installs on every host; naming the path is how this SDK opts in.
    for (const mark of Object.values(LOCAL_MARKS)) {
      assert.match(mark.src, /^\/brand\/marks\/[a-z-]+\.svg$/);
    }
  });

  it('gives all three badges their marks and changes nothing else', () => {
    const badges = copy.badges ?? [];
    assert.deepEqual(badges.map((b) => b.id), HERO_CONFIG.badges.map((b) => b.id));
    const chrome = badges.find((b) => b.id === 'chrome');
    assert.ok(chrome);
    assert.deepEqual(chrome.icon, LOCAL_MARK);
    const base = HERO_CONFIG.badges.find((b) => b.id === 'chrome');
    assert.ok(base);
    assert.deepEqual({ ...chrome, icon: undefined }, { ...base, icon: undefined });
    // Google Play, which base left without an icon (so undrawn), gets the
    // coloured Play mark; the App Store badge (1.16.0) draws the official
    // file in place of base's built-in Apple glyph.
    const play = badges.find((b) => b.id === 'google-play');
    assert.ok(play);
    assert.deepEqual(play.icon, PLAY_MARK);
    assert.equal(play.label, 'Google Play');
    const store = badges.find((b) => b.id === 'app-store');
    assert.ok(store);
    assert.deepEqual(store.icon, STORE_MARK);
    assert.equal(store.label, 'App Store');
    // All three badges draw a /brand/marks/ file.
    assert.equal(badges.length, 3);
    for (const badge of badges) {
      assert.equal(typeof badge.icon, 'object');
      assert.match((badge.icon as { src: string }).src, /^\/brand\/marks\//);
    }
    // Only the badges are overridden: the words stay base's.
    assert.deepEqual(Object.keys(copy), ['badges']);
  });

  it('leaves base\'s list alone and answers a new one', () => {
    const before = JSON.stringify(HERO_CONFIG.badges);
    const out = withLocalMarks(HERO_CONFIG.badges);
    assert.notEqual(out, HERO_CONFIG.badges);
    assert.equal(JSON.stringify(HERO_CONFIG.badges), before);
    assert.deepEqual(withLocalMarks([]), []);
    // A badge this SDK has no mark for passes through untouched.
    assert.deepEqual(withLocalMarks([{ id: 'other', href: '#', eyebrow: 'a', label: 'b' }]), [{ id: 'other', href: '#', eyebrow: 'a', label: 'b' }]);
  });

  it('the header\'s extension button draws the same file', () => {
    const extension = (menu.actions ?? []).find((a) => a.id === 'add-extension');
    assert.ok(extension);
    assert.deepEqual(extension.icon, LOCAL_MARK);
  });
});
