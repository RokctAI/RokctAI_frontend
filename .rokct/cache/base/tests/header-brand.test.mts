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

// base_sdk 1.21.0: the home SDK declares what the header's brand slot
// draws (Ray, 2026-09-09: "let home sdk declare if it needs logo there or
// not"). Run by tests/test_manifest.py against a staged copy of
// components/custom/landing/header-menu.ts (the site-metadata registry
// stubbed to a copy whose `icon` the test sets), under node's own test
// runner with type stripping.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_BRAND_COLLAPSE_DELAY_MS,
  HEADER_MENU,
  headerBrandNeedsCopy,
  isGeneratedBrandIcon,
  loadHeaderBrand,
  resolveHeaderBrand,
  resolveHeaderBrandCollapse,
} from './header-menu.ts';
import { setRegisteredIcon } from './landing-site-metadata.ts';

const GENERATED = '/brand-icon';

function srcOf(brand: { logo: unknown }): string | undefined {
  return typeof brand.logo === 'object' && brand.logo !== null
    ? (brand.logo as { src: string }).src
    : undefined;
}

describe('resolveHeaderBrand: the pure rule', () => {
  it('"none": no image at all, the wordmark is the logo', () => {
    const brand = resolveHeaderBrand({ logo: 'none' }, { icon: '/icon.png' });
    assert.equal(brand.logo, 'none');
    assert.equal(brand.wordmark, true);
  });

  it('an explicit path: exactly that src', () => {
    const brand = resolveHeaderBrand({ logo: '/images/logo.svg' }, { icon: '/icon.png' });
    assert.deepEqual(brand.logo, { src: '/images/logo.svg' });
    assert.deepEqual(
      resolveHeaderBrand({ logo: ' https://cdn.example/mark.png ' }, null).logo,
      { src: 'https://cdn.example/mark.png' },
    );
  });

  it('"auto" with no host icon registered: no img src, never the generated tile', () => {
    for (const declared of [undefined, {}, { logo: 'auto' as const }, { logo: '' }]) {
      for (const copy of [null, undefined, {}, { icon: '' }, { icon: '  ' }]) {
        const brand = resolveHeaderBrand(declared, copy);
        assert.equal(brand.logo, 'host', JSON.stringify({ declared, copy }));
        assert.equal(srcOf(brand), undefined);
        assert.ok(!JSON.stringify(brand).includes(GENERATED));
      }
    }
  });

  it('"auto" with a registered copy.icon: that src', () => {
    for (const declared of [undefined, { logo: 'auto' as const }]) {
      const brand = resolveHeaderBrand(declared, { icon: '/brand/icon.png' });
      assert.deepEqual(brand.logo, { src: '/brand/icon.png' });
    }
  });

  it('the generated tile is never the answer, declared or registered', () => {
    for (const tile of [GENERATED, `${GENERATED}?s=64`, `https://supacharge.app${GENERATED}?s=192`]) {
      assert.ok(isGeneratedBrandIcon(tile), tile);
      assert.equal(resolveHeaderBrand({ logo: tile }, null).logo, 'host');
      assert.equal(resolveHeaderBrand(undefined, { icon: tile }).logo, 'host');
      assert.deepEqual(
        resolveHeaderBrand({ logo: tile }, { icon: '/real.svg' }).logo,
        { src: '/real.svg' },
      );
    }
    assert.equal(isGeneratedBrandIcon('/brand-icons/x.png'), false);
    assert.equal(isGeneratedBrandIcon('/images/brand-icon.png'), false);
  });

  it('the wordmark renders unless the home SDK turned it off', () => {
    assert.equal(resolveHeaderBrand({ logo: '/m.svg', wordmark: false }, null).wordmark, false);
    assert.equal(resolveHeaderBrand({ logo: 'none', wordmark: true }, null).wordmark, true);
    assert.equal(resolveHeaderBrand({ logo: 'none' }, null).wordmark, true);
  });

  it('only "auto" (or nothing, or the refused tile) reaches for the copy', () => {
    assert.equal(headerBrandNeedsCopy(null), true);
    assert.equal(headerBrandNeedsCopy({}), true);
    assert.equal(headerBrandNeedsCopy({ logo: 'auto' }), true);
    assert.equal(headerBrandNeedsCopy({ logo: GENERATED }), true);
    assert.equal(headerBrandNeedsCopy({ logo: 'none' }), false);
    assert.equal(headerBrandNeedsCopy({ logo: '/images/logo.svg' }), false);
  });
});

describe('loadHeaderBrand: through the registries', () => {
  it('nothing registered: the host mark, no src', async () => {
    HEADER_MENU.length = 0;
    setRegisteredIcon(undefined);
    const brand = await loadHeaderBrand();
    assert.equal(brand.logo, 'host');
    assert.equal(brand.wordmark, true);
  });

  it('a menu declaring "none": no image (supacharge)', async () => {
    HEADER_MENU.length = 0;
    HEADER_MENU.push({
      id: 'lms-header-menu',
      load: async () => ({ default: { anchors: ['faq'], brand: { logo: 'none' } } }),
    });
    setRegisteredIcon('/brand/icon.png');
    const brand = await loadHeaderBrand();
    assert.equal(brand.logo, 'none');
  });

  it('a menu declaring a path: that src', async () => {
    HEADER_MENU.length = 0;
    HEADER_MENU.push({
      id: 'x-header-menu',
      load: async () => ({ default: { brand: { logo: '/images/logo.svg' } } }),
    });
    assert.deepEqual((await loadHeaderBrand()).logo, { src: '/images/logo.svg' });
  });

  it('a menu declaring nothing (rokct): the copy icon when registered, else the host mark', async () => {
    HEADER_MENU.length = 0;
    HEADER_MENU.push({
      id: 'agent-header-menu',
      load: async () => ({ default: { anchors: ['pricing'] } }),
    });
    setRegisteredIcon(undefined);
    assert.equal((await loadHeaderBrand()).logo, 'host');
    setRegisteredIcon('/brand/icon.png');
    assert.deepEqual((await loadHeaderBrand()).logo, { src: '/brand/icon.png' });
    setRegisteredIcon(`${GENERATED}?s=64`);
    assert.equal((await loadHeaderBrand()).logo, 'host');
  });

  it('a menu that fails to load is skipped and the host mark is drawn', async () => {
    HEADER_MENU.length = 0;
    HEADER_MENU.push({
      id: 'broken-header-menu',
      load: async () => {
        throw new Error('nope');
      },
    });
    setRegisteredIcon(undefined);
    const errors: unknown[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args);
    };
    try {
      assert.equal((await loadHeaderBrand()).logo, 'host');
    } finally {
      console.error = original;
    }
    assert.equal(errors.length, 1);
  });
});

// base_sdk 1.24.0: the badge and the collapsing brand rokct.ai's old
// header had, off unless declared.
describe('resolveHeaderBrand: badge and collapse (1.24.0)', () => {
  it('nothing declared: no badge, a still brand', () => {
    const brand = resolveHeaderBrand(null, null);
    assert.equal(brand.badge, false);
    assert.equal(brand.collapse, null);
    assert.equal(resolveHeaderBrand({ logo: 'none' }, null).badge, false);
    assert.equal(resolveHeaderBrand({ logo: '/m.svg', collapse: false }, null).collapse, null);
  });

  it('badge: true is carried whichever branch answers the logo', () => {
    assert.equal(resolveHeaderBrand({ badge: true }, null).badge, true);
    assert.equal(resolveHeaderBrand({ badge: true, logo: 'none' }, null).badge, true);
    assert.equal(resolveHeaderBrand({ badge: true, logo: '/m.svg' }, null).badge, true);
    assert.equal(resolveHeaderBrand({ badge: true }, { icon: '/i.png' }).badge, true);
  });

  it('collapse: true takes the defaults; an object overrides them', () => {
    const defaults = resolveHeaderBrand({ collapse: true }, null).collapse;
    assert.ok(defaults);
    assert.equal(defaults.delayMs, DEFAULT_BRAND_COLLAPSE_DELAY_MS);
    assert.equal(defaults.delayMs, 1500);
    assert.equal(defaults.code, null);
    const code = () => 'ZA';
    const tuned = resolveHeaderBrandCollapse({ delayMs: 250, code });
    assert.ok(tuned);
    assert.equal(tuned.delayMs, 250);
    assert.equal(tuned.code, code);
    assert.equal(tuned.code(), 'ZA');
  });

  it('a bad delay falls back to the default; false and nothing are still', () => {
    assert.equal(resolveHeaderBrandCollapse({ delayMs: -1 })?.delayMs, DEFAULT_BRAND_COLLAPSE_DELAY_MS);
    assert.equal(resolveHeaderBrandCollapse({ delayMs: Number.NaN })?.delayMs, DEFAULT_BRAND_COLLAPSE_DELAY_MS);
    assert.equal(resolveHeaderBrandCollapse({ delayMs: 0 })?.delayMs, 0);
    assert.equal(resolveHeaderBrandCollapse(false), null);
    assert.equal(resolveHeaderBrandCollapse(undefined), null);
    assert.equal(resolveHeaderBrandCollapse(null), null);
  });
});
