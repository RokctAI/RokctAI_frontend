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

// base_sdk 1.26.0: the platform marks base serves itself and the one
// dark-mode rule for the monochrome ones (Ray, 2026-09-09: "move to base,
// home sdk can choose to use them or not"). Run by tests/test_manifest.py
// against a staged copy of components/custom/landing/brand-marks.ts under
// node's own test runner with type stripping.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BRAND_MARKS,
  BRAND_MARKS_DIR,
  MONO_MARK_CLASS,
  MONO_MARK_SRCS,
  isMonoMark,
  markImageClass,
  markPath,
  type BrandMark,
  type BrandMarkId,
} from './brand-marks.ts';

const IDS: BrandMarkId[] = ['chromeWebStore', 'googlePlay', 'appGallery', 'appStore', 'windows'];

describe('BRAND_MARKS: the registry', () => {
  it('carries exactly the five marks, each { src, alt, mono }', () => {
    assert.deepEqual(Object.keys(BRAND_MARKS).sort(), [...IDS].sort());
    for (const id of IDS) {
      const mark: BrandMark = BRAND_MARKS[id];
      assert.equal(typeof mark.src, 'string');
      assert.equal(typeof mark.alt, 'string');
      assert.equal(typeof mark.mono, 'boolean');
      assert.ok(mark.alt.trim().length > 0, `${id} has alt text`);
    }
  });

  it('every src is /brand/marks/<name>.svg, a root-relative path the shell serves', () => {
    assert.equal(BRAND_MARKS_DIR, '/brand/marks/');
    for (const id of IDS) {
      const { src } = BRAND_MARKS[id];
      assert.ok(src.startsWith(BRAND_MARKS_DIR), `${id}: ${src}`);
      assert.match(src, /^\/brand\/marks\/[a-z-]+\.svg$/);
    }
  });

  it('names the files 1.26.0 installs, with the platforms’ own names', () => {
    assert.deepEqual(BRAND_MARKS.chromeWebStore, {
      src: '/brand/marks/chrome-web-store.svg',
      alt: 'Chrome Web Store',
      mono: false,
    });
    assert.deepEqual(BRAND_MARKS.googlePlay, {
      src: '/brand/marks/google-play.svg',
      alt: 'Google Play',
      mono: false,
    });
    assert.deepEqual(BRAND_MARKS.appGallery, {
      src: '/brand/marks/app-gallery.svg',
      alt: 'AppGallery',
      mono: false,
    });
    assert.deepEqual(BRAND_MARKS.appStore, {
      src: '/brand/marks/app-store.svg',
      alt: 'App Store',
      mono: true,
    });
    assert.deepEqual(BRAND_MARKS.windows, {
      src: '/brand/marks/windows.svg',
      alt: 'Windows',
      mono: true,
    });
  });

  it('a mark is the { src, alt } a hero badge or header action already takes', () => {
    const icon: { src: string; alt: string } = BRAND_MARKS.chromeWebStore;
    assert.equal(icon.src, '/brand/marks/chrome-web-store.svg');
  });

  it('MONO_MARK_SRCS is exactly the srcs flagged mono: Apple and Windows', () => {
    assert.deepEqual([...MONO_MARK_SRCS].sort(), [
      '/brand/marks/app-store.svg',
      '/brand/marks/windows.svg',
    ]);
  });
});

describe('markPath: the path part of a src', () => {
  it('trims, and drops a ?query or #hash', () => {
    assert.equal(markPath('/brand/marks/windows.svg'), '/brand/marks/windows.svg');
    assert.equal(markPath('  /brand/marks/windows.svg  '), '/brand/marks/windows.svg');
    assert.equal(markPath('/brand/marks/windows.svg?v=3'), '/brand/marks/windows.svg');
    assert.equal(markPath('/brand/marks/windows.svg#x'), '/brand/marks/windows.svg');
    assert.equal(markPath('/brand/marks/windows.svg?v=3#x'), '/brand/marks/windows.svg');
  });

  it('keeps an absolute URL’s origin', () => {
    assert.equal(
      markPath('https://cdn.example/brand/marks/windows.svg?v=1'),
      'https://cdn.example/brand/marks/windows.svg',
    );
  });
});

describe('isMonoMark: the invert rule, keyed on the src alone', () => {
  it('true for exactly the two monochrome marks’ paths', () => {
    assert.equal(isMonoMark('/brand/marks/app-store.svg'), true);
    assert.equal(isMonoMark('/brand/marks/windows.svg'), true);
    assert.equal(isMonoMark(BRAND_MARKS.appStore.src), true);
    assert.equal(isMonoMark(BRAND_MARKS.windows.src), true);
  });

  it('still true with whitespace, a cache-busting query or a hash', () => {
    assert.equal(isMonoMark(' /brand/marks/app-store.svg '), true);
    assert.equal(isMonoMark('/brand/marks/windows.svg?v=2'), true);
    assert.equal(isMonoMark('/brand/marks/app-store.svg#mark'), true);
  });

  it('false for the coloured marks: never filtered', () => {
    assert.equal(isMonoMark(BRAND_MARKS.chromeWebStore.src), false);
    assert.equal(isMonoMark(BRAND_MARKS.googlePlay.src), false);
    assert.equal(isMonoMark(BRAND_MARKS.appGallery.src), false);
  });

  it('false for any other image: another path, the basename alone, an absolute URL', () => {
    assert.equal(isMonoMark('/images/logo.svg'), false);
    assert.equal(isMonoMark('windows.svg'), false);
    assert.equal(isMonoMark('/windows.svg'), false);
    assert.equal(isMonoMark('/brand/windows.svg'), false);
    assert.equal(isMonoMark('/brand/marks/windows.png'), false);
    assert.equal(isMonoMark('/brand/marks/WINDOWS.svg'), false);
    assert.equal(isMonoMark('https://cdn.example/brand/marks/windows.svg'), false);
  });

  it('false for nothing at all', () => {
    assert.equal(isMonoMark(''), false);
    assert.equal(isMonoMark('   '), false);
    assert.equal(isMonoMark(undefined), false);
    assert.equal(isMonoMark(null), false);
  });
});

describe('markImageClass: what the <img> carries', () => {
  it('is the Tailwind dark-mode invert, and only that', () => {
    assert.equal(MONO_MARK_CLASS, 'dark:invert');
  });

  it('a mono mark gets the class; anything else gets undefined, never ""', () => {
    assert.equal(markImageClass('/brand/marks/app-store.svg'), 'dark:invert');
    assert.equal(markImageClass('/brand/marks/windows.svg?v=1'), 'dark:invert');
    assert.equal(markImageClass('/brand/marks/google-play.svg'), undefined);
    assert.equal(markImageClass('/brand/marks/chrome-web-store.svg'), undefined);
    assert.equal(markImageClass('/logo.png'), undefined);
    assert.equal(markImageClass(''), undefined);
    assert.equal(markImageClass(undefined), undefined);
  });
});
