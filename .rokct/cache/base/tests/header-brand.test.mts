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
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  BRAND_CODE_FONT_SIZE,
  BRAND_CODE_SCALE,
  BRAND_MARK_SIZE_PX,
  BRAND_STEM_CODE_FONT_SIZE,
  BRAND_STEM_FONT_SIZE,
  DEFAULT_BRAND_COLLAPSE_DELAY_MS,
  HEADER_MENU,
  brandFoldsToLetter,
  brandFoldsToStem,
  brandLetterOf,
  brandStemOf,
  headerBrandNeedsCopy,
  isGeneratedBrandIcon,
  loadHeaderBrand,
  megaTriggerLabel,
  resolveHeaderBrand,
  resolveHeaderBrandCollapse,
  resolveHeaderMenu,
  resolveHeaderMenuGroupLayout,
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
    for (const tile of [GENERATED, `${GENERATED}?s=64`, `https://supacharge.school${GENERATED}?s=192`]) {
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

// base_sdk 1.25.0: an action's icon may be an image the shell serves itself
// (Ray, 2026-09-09: "use it but bring it local"); the resolver carries it
// through untouched, beside a named glyph and beside no icon at all.
describe('resolveHeaderMenu: action icons (1.25.0)', () => {
  const image = { src: '/brand/marks/chrome-web-store.svg', alt: 'Chrome Web Store' };
  const menu = {
    actions: [
      { id: 'plain', label: 'Plain', href: '/plain' },
      { id: 'glyph', label: 'Glyph', href: '/glyph', icon: 'chrome' as const },
      { id: 'image', label: 'Image', href: 'https://chromewebstore.google.com/', external: true, icon: image },
    ],
  };

  it('an image icon is carried verbatim; a glyph and no icon as before', () => {
    const resolved = resolveHeaderMenu(menu, []);
    assert.equal(resolved.actions.length, 3);
    assert.equal(resolved.actions[0].icon, undefined);
    assert.equal(resolved.actions[1].icon, 'chrome');
    assert.deepEqual(resolved.actions[2].icon, image);
    assert.equal(resolved.actions[2].external, true);
  });

  it('the actions are a copy, in the declared order', () => {
    const resolved = resolveHeaderMenu(menu, []);
    assert.notEqual(resolved.actions, menu.actions);
    assert.deepEqual(resolved.actions.map((a) => a.id), ['plain', 'glyph', 'image']);
    assert.deepEqual(resolveHeaderMenu(null, []).actions, []);
  });
});

// base_sdk 1.28.0: a collapsing brand with no image folds into a letter
// tile (Ray, 2026-09-10: "since supacharge has not icon cant it fold and
// only leave the first letter as its icon?").
describe('brandLetterOf: the letter the name folds into (1.28.0)', () => {
  it('the first letter, uppercased - the tab tile\'s rule', () => {
    assert.equal(brandLetterOf('Supacharge'), 'S');
    assert.equal(brandLetterOf('Rokct'), 'R');
    assert.equal(brandLetterOf('  Juvo '), 'J');
  });

  it('a name starting with a lowercase letter is uppercased', () => {
    assert.equal(brandLetterOf('juvo'), 'J');
    assert.equal(brandLetterOf('éclair'), 'É');
  });

  it('a name starting with a digit keeps the digit', () => {
    assert.equal(brandLetterOf('3scale'), '3');
    assert.equal(brandLetterOf('7'), '7');
  });

  it('punctuation and space before the name are skipped; no letter, no tile', () => {
    assert.equal(brandLetterOf('-- x'), 'X');
    assert.equal(brandLetterOf('***'), '');
    assert.equal(brandLetterOf(''), '');
    assert.equal(brandLetterOf('   '), '');
    assert.equal(brandLetterOf(null), '');
    assert.equal(brandLetterOf(undefined), '');
  });
});

describe('brandFoldsToLetter: only a collapsing brand with no image (1.28.0)', () => {
  it('"none" with a collapse declared: the tile (supacharge)', () => {
    assert.equal(brandFoldsToLetter(resolveHeaderBrand({ logo: 'none', collapse: true }, null)), true);
    assert.equal(
      brandFoldsToLetter(
        resolveHeaderBrand({ logo: 'none', collapse: { delayMs: 1500, code: () => 'ZA' } }, { icon: '/i.png' }),
      ),
      true,
    );
  });

  it('no collapse declared: never a tile, whatever the logo', () => {
    assert.equal(brandFoldsToLetter(resolveHeaderBrand({ logo: 'none' }, null)), false);
    assert.equal(brandFoldsToLetter(resolveHeaderBrand({ logo: 'none', collapse: false }, null)), false);
    assert.equal(brandFoldsToLetter(resolveHeaderBrand(null, null)), false);
    assert.equal(brandFoldsToLetter(resolveHeaderBrand({ logo: '/m.svg' }, null)), false);
  });

  it('a declared image, a registered icon or the host mark: that mark folds, not a tile (rokct)', () => {
    assert.equal(brandFoldsToLetter(resolveHeaderBrand({ logo: '/m.svg', collapse: true }, null)), false);
    assert.equal(brandFoldsToLetter(resolveHeaderBrand({ collapse: true }, { icon: '/i.png' })), false);
    assert.equal(brandFoldsToLetter(resolveHeaderBrand({ badge: true, collapse: { delayMs: 1500 } }, null)), false);
    assert.equal(resolveHeaderBrand({ badge: true, collapse: { delayMs: 1500 } }, null).logo, 'host');
  });

  it('the resolved shape is unchanged for a shell that declares no collapse', () => {
    assert.deepEqual(resolveHeaderBrand({ logo: 'none' }, null), {
      logo: 'none',
      wordmark: true,
      badge: false,
      collapse: null,
    });
    assert.deepEqual(resolveHeaderBrand(null, null), {
      logo: 'host',
      wordmark: true,
      badge: false,
      collapse: null,
    });
  });
});

// base_sdk 1.29.0: a dotted name folds to its stem (Ray, 2026-09-10: "if
// sitename has a dot, fold dot and what comes after so they s will never
// show anymore unless there is icon, if there is icon it fold further to
// leave only icon").
describe('brandStemOf: the text before the first dot (1.29.0)', () => {
  it('a dotted name: the stem; the dot and what follows fold away', () => {
    assert.equal(brandStemOf('supacharge.school'), 'supacharge');
    assert.equal(brandStemOf('rokct.ai'), 'rokct');
    assert.equal(brandStemOf('  supacharge.school '), 'supacharge');
    assert.equal(brandStemOf('Juvo.app'), 'Juvo');
  });

  it('only the first dot counts: "a.b.c" gives "a", "x." gives "x"', () => {
    assert.equal(brandStemOf('a.b.c'), 'a');
    assert.equal(brandStemOf('x.'), 'x');
    assert.equal(brandStemOf('x.y'), 'x');
  });

  it('not dotted: no dot, a leading dot, nothing before the dot, no name', () => {
    assert.equal(brandStemOf('Supacharge'), null);
    assert.equal(brandStemOf('Rokct'), null);
    assert.equal(brandStemOf('.x'), null);
    assert.equal(brandStemOf('.'), null);
    assert.equal(brandStemOf('  .school'), null);
    assert.equal(brandStemOf(''), null);
    assert.equal(brandStemOf('   '), null);
    assert.equal(brandStemOf(null), null);
    assert.equal(brandStemOf(undefined), null);
  });
});

describe('brandFoldsToStem: an icon-less collapsing brand with a dotted name (1.29.0)', () => {
  const iconless = resolveHeaderBrand({ logo: 'none', collapse: true }, null);

  it('a dotted name and no icon: the stem, never the letter tile (supacharge)', () => {
    assert.equal(brandFoldsToStem(iconless, 'supacharge.school'), true);
    assert.equal(brandStemOf('supacharge.school'), 'supacharge');
    assert.equal(
      brandFoldsToStem(
        resolveHeaderBrand({ logo: 'none', collapse: { delayMs: 1500, code: () => 'ZA' } }, { icon: '/i.png' }),
        'supacharge.school',
      ),
      true,
    );
    // The 1.28.0 rule alone still answers the tile for this brand; the
    // header asks the stem rule first, so the tile is never reached.
    assert.equal(brandFoldsToLetter(iconless), true);
  });

  it('an icon - a declared image, a registered icon or the host mark: folds to the icon, whatever the name (rokct)', () => {
    for (const brand of [
      resolveHeaderBrand({ logo: '/m.svg', collapse: true }, null),
      resolveHeaderBrand({ collapse: true }, { icon: '/i.png' }),
      resolveHeaderBrand({ badge: true, collapse: { delayMs: 1500 } }, null),
    ]) {
      for (const name of ['rokct.ai', 'supacharge.school', 'Rokct']) {
        assert.equal(brandFoldsToStem(brand, name), false, JSON.stringify({ brand, name }));
        assert.equal(brandFoldsToLetter(brand), false);
      }
    }
  });

  it('no dot and no icon: the 1.28.0 letter tile, unchanged', () => {
    assert.equal(brandFoldsToStem(iconless, 'Supacharge'), false);
    assert.equal(brandFoldsToLetter(iconless), true);
    assert.equal(brandLetterOf('Supacharge'), 'S');
  });

  it('the edge cases follow brandStemOf: ".x" is not dotted, "x." and "a.b.c" are', () => {
    assert.equal(brandFoldsToStem(iconless, '.x'), false);
    assert.equal(brandFoldsToStem(iconless, 'x.'), true);
    assert.equal(brandFoldsToStem(iconless, 'a.b.c'), true);
    assert.equal(brandFoldsToStem(iconless, ''), false);
    assert.equal(brandFoldsToStem(iconless, null), false);
  });

  it('a still brand never folds; a wordmark turned off has no stem to keep', () => {
    assert.equal(brandFoldsToStem(resolveHeaderBrand({ logo: 'none' }, null), 'supacharge.school'), false);
    assert.equal(brandFoldsToStem(resolveHeaderBrand(null, null), 'rokct.ai'), false);
    assert.equal(
      brandFoldsToStem(resolveHeaderBrand({ logo: 'none', wordmark: false, collapse: true }, null), 'supacharge.school'),
      false,
    );
  });
});

// base_sdk 1.29.0: the stem wordmark sizes itself to the name so a long
// dotted name never widens the bar before the fold nor pushes the burger
// off a phone after it (measured on a 17-character name at 60px: 514px
// at load, a 320px stem at 390). Pure CSS: the 60px of the large
// wordmark when the whole name fits, else a width budget of the
// viewport divided by the name's character count.
describe('BRAND_STEM_FONT_SIZE: the stem wordmark fits the bar (1.29.0)', () => {
  const RULE = /^min\((\d+)px, calc\(\((\d+)vw \+ (\d+)px\) \/ \(var\(--brand-chars\) \* ([\d.]+)\)\)\)$/;

  /** What the rule computes: the font size in px for `chars` at `vw`. */
  function fontPx(chars: number, vw: number): number {
    const m = RULE.exec(BRAND_STEM_FONT_SIZE);
    assert.ok(m, BRAND_STEM_FONT_SIZE);
    const [, cap, slope, offset, emPerChar] = m.map(Number);
    return Math.min(cap, ((slope / 100) * vw + offset) / (chars * emPerChar));
  }

  /** The text width the rule guarantees: at most 0.6em per character. */
  function boundPx(chars: number, vw: number): number {
    return fontPx(chars, vw) * chars * 0.6;
  }

  it('is a pure CSS min/calc over --brand-chars, capped at the 60px large wordmark', () => {
    assert.equal(BRAND_STEM_FONT_SIZE, 'min(60px, calc((20vw + 140px) / (var(--brand-chars) * 0.6)))');
    assert.ok(RULE.test(BRAND_STEM_FONT_SIZE));
    assert.equal(fontPx(1, 390), 60);
  });

  it('17 characters stay under 230px at 390, 300px at 768 and 400px at 1280', () => {
    assert.ok(boundPx(17, 390) < 230, String(boundPx(17, 390)));
    assert.ok(boundPx(17, 768) < 300, String(boundPx(17, 768)));
    assert.ok(boundPx(17, 1280) < 400, String(boundPx(17, 1280)));
    assert.ok(fontPx(17, 390) > 20, 'still larger than the still brand\'s text-xl');
  });

  it('a 5-letter name at 1280 keeps the 60px the slot was tuned for', () => {
    assert.equal(fontPx(5, 1280), 60);
    assert.ok(boundPx(5, 1280) <= 180);
  });

  it('the stem shares the size and, at 390, leaves the burger on screen', () => {
    // 10 of the 17 characters at the same size, plus code (53) + chevron
    // (18) + burger (40) + the bar's padding (32), within 390.
    const stem = fontPx(17, 390) * 10 * 0.6;
    assert.ok(stem + 53 + 18 + 40 + 32 < 390, String(stem));
  });

  it('the header sets it once on the wordmark span, no 60px class, both spans inherit it', () => {
    const header = readFileSync(new URL('./header.tsx', import.meta.url), 'utf8');
    const wordmark = header.slice(header.indexOf('function BrandStemWordmark('), header.indexOf('function BrandBlock('));
    assert.ok(wordmark.length > 0);
    assert.ok(
      wordmark.includes(
        'const size = { "--brand-chars": name.trim().length, fontSize: BRAND_STEM_FONT_SIZE } as React.CSSProperties;',
      ),
    );
    assert.ok(wordmark.includes('style={size}'));
    assert.ok(
      wordmark.includes(
        'className="flex shrink-0 items-center whitespace-nowrap pt-0.5 font-bold tracking-tighter leading-none text-foreground"',
      ),
    );
    assert.ok(!wordmark.includes('text-[60px]'));
    assert.ok(!wordmark.includes('text-['));
    assert.equal(wordmark.match(/fontSize/g)?.length, 1);
    // Neither inner span sizes itself: the stem and the suffix inherit.
    assert.ok(wordmark.includes('<span>{stem}</span>'));
    assert.ok(wordmark.includes('<span className="min-w-0 overflow-hidden">{suffix}</span>'));
    // The 1.24.0 Branding slot keeps its 60px literal.
    assert.ok(header.includes('<Branding className="text-[60px] tracking-tighter leading-none" />'));
  });
});

// base_sdk 1.31.0 (Ray, 2026-09-10: "look at rokct header's country code
// and then check supacharge's"): beside a mark the code is 36px against a
// 44px mark on every viewport, so it is always the smaller; beside a stem
// wordmark, which BRAND_STEM_FONT_SIZE shrinks to fit the bar, a 36px code
// outgrew the wordmark on a phone. The code follows the stem: its 36px
// where the stem is at least that, else the stem's own size.
describe('BRAND_STEM_CODE_FONT_SIZE: the code beside a stem never outgrows it (1.31.0)', () => {
  const STEM = /^min\((\d+)px, calc\(\((\d+)vw \+ (\d+)px\) \/ \(var\(--brand-chars\) \* ([\d.]+)\)\)\)$/;

  function stemPx(chars: number, vw: number): number {
    const m = STEM.exec(BRAND_STEM_FONT_SIZE);
    assert.ok(m, BRAND_STEM_FONT_SIZE);
    const [, cap, slope, offset, emPerChar] = m.map(Number);
    return Math.min(cap, ((slope / 100) * vw + offset) / (chars * emPerChar));
  }

  /** The cap in px: the original superscript scale of the 44px mark (1.36.0). */
  const CAP = BRAND_MARK_SIZE_PX * BRAND_CODE_SCALE;

  /** What the rule computes: the code's font size in px for `chars` at `vw`. */
  function codePx(chars: number, vw: number): number {
    const m = /^min\(calc\((\d+)px \* ([\d.]+)\), (.+)\)$/.exec(BRAND_STEM_CODE_FONT_SIZE);
    assert.ok(m, BRAND_STEM_CODE_FONT_SIZE);
    assert.equal(m[3], BRAND_STEM_FONT_SIZE);
    return Math.min(Number(m[1]) * Number(m[2]), stemPx(chars, vw));
  }

  it('is the original superscript size capped at the stem rule, pure CSS over the same --brand-chars (1.36.0)', () => {
    // rokct.ai's original header: a 44px mark, and the branding cache's
    // 0.28em superscript laid over the code span - about 12px.
    assert.equal(BRAND_MARK_SIZE_PX, 44);
    assert.equal(BRAND_CODE_SCALE, 0.28);
    assert.equal(BRAND_CODE_FONT_SIZE, 'calc(44px * 0.28)');
    assert.ok(Math.abs(CAP - 12.32) < 1e-9, String(CAP));
    assert.equal(
      BRAND_STEM_CODE_FONT_SIZE,
      'min(calc(44px * 0.28), min(60px, calc((20vw + 140px) / (var(--brand-chars) * 0.6))))',
    );
    assert.equal(BRAND_STEM_CODE_FONT_SIZE, `min(${BRAND_CODE_FONT_SIZE}, ${BRAND_STEM_FONT_SIZE})`);
    assert.ok(!BRAND_STEM_CODE_FONT_SIZE.includes('36px'), 'the 36px fallback is gone from the stem branch');
  });

  it('where the stem is at least the cap the code is the cap: 5 letters at 60px; 17 characters at 1280, 768 and 390', () => {
    assert.equal(stemPx(5, 1280), 60);
    assert.equal(codePx(5, 1280), CAP);
    for (const vw of [390, 768, 1280]) {
      assert.ok(stemPx(17, vw) > CAP, `${vw}: ${stemPx(17, vw)}`);
      assert.equal(codePx(17, vw), CAP);
    }
    // Old (1.31.0) vs new at the three widths for a 17-character name:
    // 1280: 36 -> 12.32; 768: 28.78 -> 12.32; 390: 21.37 -> 12.32.
    assert.ok(Math.abs(stemPx(17, 1280) - 38.82) < 0.01, String(stemPx(17, 1280)));
    assert.ok(Math.abs(stemPx(17, 768) - 28.78) < 0.01, String(stemPx(17, 768)));
    assert.ok(Math.abs(stemPx(17, 390) - 21.37) < 0.01, String(stemPx(17, 390)));
  });

  it('where the stem is smaller than the cap the code is the stem\'s size (a name too long for the bar)', () => {
    assert.ok(stemPx(60, 320) < CAP, String(stemPx(60, 320)));
    assert.equal(codePx(60, 320), stemPx(60, 320));
  });

  it('never larger than the stem, never larger than the cap, for any name at any width', () => {
    for (const chars of [1, 5, 10, 17, 30, 60]) {
      for (const vw of [320, 390, 768, 1024, 1280, 1920]) {
        assert.ok(codePx(chars, vw) <= stemPx(chars, vw), `${chars}@${vw}`);
        assert.ok(codePx(chars, vw) <= CAP, `${chars}@${vw}`);
      }
    }
  });

  it('the header applies it only beside a stem, laid out as the stem is; beside a mark the 1.24.0 code is untouched', () => {
    const header = readFileSync(new URL('./header.tsx', import.meta.url), 'utf8');
    const collapsing = header.slice(header.indexOf('function CollapsingBrand('), header.indexOf('const UNDECLARED_BRAND'));
    assert.ok(collapsing.length > 0);
    // The stem branch: centred with the stem's leading and top padding, at
    // the capped stem size with the same --brand-chars the stem takes.
    assert.ok(
      collapsing.includes(
        '? "ml-1 inline-block self-center pt-0.5 font-medium leading-none text-foreground transition-all duration-500 ease-in-out"',
      ),
    );
    assert.ok(
      collapsing.includes(
        '? ({ "--brand-chars": PLATFORM_NAME.trim().length, fontSize: BRAND_STEM_CODE_FONT_SIZE } as React.CSSProperties)',
      ),
    );
    // The mark branch: the 1.24.0 literals, class and inline style.
    assert.ok(
      collapsing.includes(
        ': "ml-1 inline-block self-start text-[36px] font-medium text-foreground transition-all duration-500 ease-in-out"',
      ),
    );
    assert.ok(collapsing.includes(': { marginTop: "-2px" };'));
    // Chosen by the stem rule, and the declaration\'s own style still wins.
    assert.ok(collapsing.includes('const codeClassName =\n    stem !== null\n      ? "ml-1'));
    assert.ok(collapsing.includes('const codeStyle: React.CSSProperties =\n    stem !== null\n      ? ({'));
    assert.ok(collapsing.includes('style={{ ...codeStyle, ...(code.style as React.CSSProperties | undefined) }}'));
    assert.ok(collapsing.includes('className={codeClassName}'));
    // The stem wordmark itself is unchanged.
    const wordmark = header.slice(header.indexOf('function BrandStemWordmark('), header.indexOf('function BrandBlock('));
    assert.ok(!wordmark.includes('BRAND_STEM_CODE_FONT_SIZE'));
    assert.equal(header.match(/fontSize: BRAND_STEM_CODE_FONT_SIZE/g)?.length, 1);
  });
});

describe('mega menu layout: a row group and the declared trigger word (1.36.0)', () => {
  const nav = [
    { id: 'sessions', label: 'Sessions' },
    { id: 'subjects', label: 'Subjects' },
  ];
  const apps = {
    id: 'apps',
    label: 'Get the app',
    layout: 'row' as const,
    items: [
      { id: 'a', label: 'A', href: '/a', description: 'one', icon: 'smartphone' as const },
      { id: 'b', label: 'B', href: '/b', description: 'two', icon: 'smartphone' as const },
      { id: 'c', label: 'C', href: '/c', description: 'three', icon: 'box' as const },
    ],
  };
  const explore = { id: 'explore', label: 'Explore', items: [{ anchor: 'sessions' }, { anchor: 'subjects' }] };

  it('resolveHeaderMenuGroupLayout: "row" when asked for, "column" for anything else', () => {
    assert.equal(resolveHeaderMenuGroupLayout('row'), 'row');
    assert.equal(resolveHeaderMenuGroupLayout('column'), 'column');
    assert.equal(resolveHeaderMenuGroupLayout(undefined), 'column');
    assert.equal(resolveHeaderMenuGroupLayout(null), 'column');
    assert.equal(resolveHeaderMenuGroupLayout('grid' as unknown as 'row'), 'column');
  });

  it('a resolved group carries its layout, defaulted to "column"', () => {
    const menu = resolveHeaderMenu({ groups: [apps, explore] }, nav);
    assert.deepEqual(menu.groups.map((g) => [g.id, g.layout]), [['apps', 'row'], ['explore', 'column']]);
    assert.equal(menu.groups[0].items.length, 3);
  });

  it('megaLabel wins over the first group\'s label; without it the first group\'s label is the trigger', () => {
    const declared = resolveHeaderMenu({ megaLabel: 'Explore', groups: [apps, explore] }, nav);
    assert.equal(declared.megaLabel, 'Explore');
    assert.equal(megaTriggerLabel(declared), 'Explore');
    assert.equal(declared.groups[0].label, 'Get the app');
    const undeclared = resolveHeaderMenu({ groups: [apps, explore] }, nav);
    assert.equal(undeclared.megaLabel, null);
    assert.equal(megaTriggerLabel(undeclared), 'Get the app');
    const blank = resolveHeaderMenu({ megaLabel: '   ', groups: [explore] }, nav);
    assert.equal(blank.megaLabel, null);
    assert.equal(megaTriggerLabel(blank), 'Explore');
    assert.equal(megaTriggerLabel(resolveHeaderMenu({ megaLabel: 'Explore' }, nav)), null);
    assert.equal(resolveHeaderMenu(null, nav).megaLabel, null);
  });

  it('the panel renders a row group\'s items in ONE row container and reads the declared word', () => {
    const partials = readFileSync(new URL('./header-menu.tsx', import.meta.url), 'utf8');
    const items = partials.slice(partials.indexOf('function PanelItems('), partials.indexOf('function DesktopMegaMenu('));
    assert.ok(items.includes('data-layout={layout}'));
    assert.ok(items.includes('? "flex flex-col gap-3 md:flex-row md:items-stretch"'));
    assert.ok(items.includes('className={row ? "min-w-0 flex-1" : undefined}'));
    const menu = partials.slice(partials.indexOf('function DesktopMegaMenu('), partials.indexOf('export interface HeaderMenuNavProps'));
    assert.ok(menu.includes('const label = megaTriggerLabel({ groups, megaLabel });'));
    assert.ok(menu.includes('<span>{label}</span>'));
    assert.ok(!menu.includes('<span>{lead.label}</span>'));
    assert.ok(menu.includes('<PanelItems items={lead.items} layout={lead.layout} onNavigate={close} />'));
    assert.ok(menu.includes('<PanelItems items={group.items} layout={group.layout} onNavigate={close} />'));
    // A row lead widens the lead column; a stacked lead keeps its 300px.
    assert.ok(partials.includes('const LEAD_ROW_WIDTH = "w-[58%] shrink-0";'));
    assert.ok(menu.includes(': "w-[300px] shrink-0";'));
    assert.ok(partials.includes('{groups.length > 0 && <DesktopMegaMenu groups={groups} megaLabel={megaLabel} />}'));
  });
});
