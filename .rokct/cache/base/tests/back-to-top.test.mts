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

// base_sdk 1.42.0: the floating "Back to top" button's rules (Ray,
// 2026-09-11 12:32Z: "whats missing is floating push to home, that button
// you press and it get you to top i just forgot what it says"). Run by
// tests/test_manifest.py against a staged copy of
// components/custom/landing/back-to-top.ts under node's own test runner
// with type stripping: the threshold, the shown-or-hidden answer, the
// words and the scroll behaviour, with no DOM.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BACK_TO_TOP_BOTTOM,
  BACK_TO_TOP_ICONS,
  BACK_TO_TOP_ICON_PATHS,
  BACK_TO_TOP_LEFT,
  BACK_TO_TOP_POSITIONS,
  BACK_TO_TOP_SHAPES,
  BACK_TO_TOP_SHORT_LABEL,
  BACK_TO_TOP_STYLE_VARIABLES,
  DEFAULT_BACK_TO_TOP,
  MIN_ICON_CONTRAST,
  SHORT_PAGE_SHARE,
  TEXT_ARROW_HEAD_PATH,
  backToTopVariables,
  contrastRatio,
  contrastTone,
  defaultRadius,
  horizontalFor,
  inkFor,
  isSafeCssValue,
  parseColour,
  resolveBackToTop,
  visibleLabel,
  BACK_TO_TOP_LABEL,
  BACK_TO_TOP_RIGHT,
  CORNER_REACH,
  FLOATING_ATTRIBUTE,
  FLOATING_GAP,
  FLOATING_SELECTOR,
  REDUCED_MOTION_MEDIA_QUERY,
  bottomFor,
  floatingLift,
  isPastThreshold,
  resolveThreshold,
  scrollBehaviour,
  yieldsToFrame,
} from './back-to-top.ts';

describe('the words', () => {
  it('names the control the way the standard control is named', () => {
    assert.equal(BACK_TO_TOP_LABEL, 'Back to top');
  });

  it('asks the reduced-motion preference by its media query', () => {
    assert.equal(REDUCED_MOTION_MEDIA_QUERY, '(prefers-reduced-motion: reduce)');
  });
});

describe('resolveThreshold: the distance before the button shows', () => {
  it('is one viewport height when nothing is configured', () => {
    assert.equal(resolveThreshold(undefined, 900), 900);
    assert.equal(resolveThreshold(undefined, 640.5), 640.5);
  });

  it('is the configured distance when it is a finite, non-negative number', () => {
    assert.equal(resolveThreshold(300, 900), 300);
    assert.equal(resolveThreshold(0, 900), 0);
    assert.equal(resolveThreshold(1500, 0), 1500);
  });

  it('falls back to the viewport for a negative, NaN or infinite configuration', () => {
    assert.equal(resolveThreshold(-1, 900), 900);
    assert.equal(resolveThreshold(Number.NaN, 900), 900);
    assert.equal(resolveThreshold(Number.POSITIVE_INFINITY, 900), 900);
  });

  it('answers 0 for a viewport not yet measured, so any scroll shows the button', () => {
    assert.equal(resolveThreshold(undefined, 0), 0);
    assert.equal(resolveThreshold(undefined, -1), 0);
    assert.equal(resolveThreshold(undefined, Number.NaN), 0);
  });
});

describe('isPastThreshold: shown or hidden', () => {
  it('is hidden at the very top whatever the threshold', () => {
    assert.equal(isPastThreshold(0, 0), false);
    assert.equal(isPastThreshold(0, 900), false);
  });

  it('is hidden at the threshold and shown strictly past it', () => {
    assert.equal(isPastThreshold(900, 900), false);
    assert.equal(isPastThreshold(901, 900), true);
    assert.equal(isPastThreshold(1500, 900), true);
    assert.equal(isPastThreshold(1, 0), true);
  });

  it('is hidden for a scroll offset that was never measured', () => {
    assert.equal(isPastThreshold(Number.NaN, 0), false);
  });
});

describe('scrollBehaviour: the jump', () => {
  it('is smooth by default', () => {
    assert.equal(scrollBehaviour(false), 'smooth');
  });

  it('is the instant jump under reduced motion', () => {
    // "instant", not "auto": "auto" follows a page's CSS scroll-behavior.
    assert.equal(scrollBehaviour(true), 'instant');
  });
});

// base_sdk 1.56.0 (Ray, 2026-10-31: "every app shell need the button to go
// up"): the root button on every page yields to a framed one, the button
// clears the safe-area insets and rises above a floating element in its
// corner.

describe('yieldsToFrame: one button per page', () => {
  it('lets the root button draw while no framed button is mounted', () => {
    assert.equal(yieldsToFrame('root', 0), false);
  });

  it('steps the root button aside while any framed button is mounted', () => {
    assert.equal(yieldsToFrame('root', 1), true);
    assert.equal(yieldsToFrame('root', 2), true);
  });

  it('never steps a framed button aside', () => {
    assert.equal(yieldsToFrame('frame', 0), false);
    assert.equal(yieldsToFrame('frame', 3), false);
  });

  it('lets the root button draw for a count that is not a number', () => {
    assert.equal(yieldsToFrame('root', Number.NaN), false);
  });
});

describe('the floating declaration', () => {
  it('is one attribute, measured through its selector', () => {
    assert.equal(FLOATING_ATTRIBUTE, 'data-rokct-floating');
    assert.equal(FLOATING_SELECTOR, '[data-rokct-floating]');
    assert.equal(FLOATING_GAP, 12);
    assert.equal(CORNER_REACH, 120);
  });
});

describe('floatingLift: clearing a floating element in the corner', () => {
  const vw = 390;
  const vh = 844;
  // A 56px WhatsApp bubble 16px from the bottom-right corner.
  const bubble = { top: 772, right: 374, bottom: 828, width: 56, height: 56 };

  it('is 0 with nothing to clear', () => {
    assert.equal(floatingLift([], vw, vh), 0);
  });

  it('rises above a corner bubble by the gap', () => {
    assert.equal(floatingLift([bubble], vw, vh), vh - 772 + FLOATING_GAP);
  });

  it('clears the highest of several corner elements', () => {
    const cookie = { top: 700, right: 390, bottom: 760, width: 200, height: 60 };
    assert.equal(floatingLift([bubble, cookie], vw, vh), vh - 700 + FLOATING_GAP);
  });

  it('rounds up to a whole pixel', () => {
    assert.equal(floatingLift([{ ...bubble, top: 771.4 }], vw, vh), Math.ceil(vh - 771.4 + FLOATING_GAP));
  });

  it('ignores an element away from the right edge', () => {
    assert.equal(floatingLift([{ ...bubble, right: 120 }], vw, vh), 0);
  });

  it('ignores an element away from the bottom edge', () => {
    assert.equal(floatingLift([{ ...bubble, top: 100, bottom: 156 }], vw, vh), 0);
  });

  it('ignores an element with no size (hidden)', () => {
    assert.equal(floatingLift([{ ...bubble, width: 0 }], vw, vh), 0);
    assert.equal(floatingLift([{ ...bubble, height: 0 }], vw, vh), 0);
  });

  it('is 0 for a viewport not yet measured', () => {
    assert.equal(floatingLift([bubble], 0, vh), 0);
    assert.equal(floatingLift([bubble], vw, Number.NaN), 0);
  });
});

describe('the resting place and the safe-area insets', () => {
  it('rests at the gap above the bottom inset and any site offset', () => {
    assert.match(BACK_TO_TOP_BOTTOM, /var\(--back-to-top-gap, 1rem\)/);
    assert.match(BACK_TO_TOP_BOTTOM, /env\(safe-area-inset-bottom, 0px\)/);
    assert.match(BACK_TO_TOP_BOTTOM, /var\(--back-to-top-offset, 0px\)/);
  });

  it('keeps the gap from the right inset', () => {
    assert.match(BACK_TO_TOP_RIGHT, /var\(--back-to-top-gap, 1rem\)/);
    assert.match(BACK_TO_TOP_RIGHT, /env\(safe-area-inset-right, 0px\)/);
  });

  it('takes the resting place with nothing to clear', () => {
    assert.equal(bottomFor(0), BACK_TO_TOP_BOTTOM);
    assert.equal(bottomFor(-5), BACK_TO_TOP_BOTTOM);
    assert.equal(bottomFor(Number.NaN), BACK_TO_TOP_BOTTOM);
  });

  it('rises to clear a lift, never lower than the resting place', () => {
    assert.equal(bottomFor(84), `max(${BACK_TO_TOP_BOTTOM}, 84px)`);
  });
});

// base_sdk 1.56.0, per site (Ray, 2026-10-31: the button must not look the
// same on every site): the layered config, its variables, its placement,
// the shapes' words, the icons, the contrast guarantee and the short-page
// threshold.

describe('resolveBackToTop: the layered config', () => {
  it('is the neutral fallback with no layer: on, bottom right, ri-arrow-up-line in a circle', () => {
    assert.deepEqual(resolveBackToTop(), { enabled: true, position: 'bottom-right', icon: 'arrow-up', shape: 'circle' });
    assert.deepEqual(resolveBackToTop(undefined, null, {}), DEFAULT_BACK_TO_TOP);
  });

  it('takes every option a layer sets', () => {
    for (const position of BACK_TO_TOP_POSITIONS) assert.equal(resolveBackToTop({ position }).position, position);
    for (const icon of BACK_TO_TOP_ICONS) assert.equal(resolveBackToTop({ icon }).icon, icon);
    for (const shape of BACK_TO_TOP_SHAPES) assert.equal(resolveBackToTop({ shape }).shape, shape);
    const full = resolveBackToTop({
      label: ' Up ', background: '#111111', foreground: 'hsl(var(--primary))', hoverBackground: '#222',
      hoverForeground: '#fff', border: 'transparent', ring: 'var(--ring-x)', offset: 24, showAfter: 400,
      radius: 'var(--radius)', size: '3rem', fontFamily: 'var(--font-display)', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '12px', borderWidth: '2px',
      borderStyle: 'dashed', shadow: 'none', duration: '120ms', easing: 'cubic-bezier(0.2, 0, 0, 1)',
    });
    assert.equal(full.label, 'Up');
    assert.equal(full.offset, 24);
    assert.equal(full.showAfter, 400);
    assert.equal(full.fontWeight, '700');
    assert.equal(full.borderStyle, 'dashed');
    assert.equal(full.easing, 'cubic-bezier(0.2, 0, 0, 1)');
  });

  it('lets a later layer win the fields it sets and keep the rest', () => {
    const home = { shape: 'text-arrow', icon: 'rocket', foreground: '#ff6600' } as const;
    const site = { position: 'bottom-left', foreground: '#0033cc' } as const;
    const out = resolveBackToTop(home, site);
    assert.equal(out.shape, 'text-arrow');
    assert.equal(out.icon, 'rocket');
    assert.equal(out.position, 'bottom-left');
    assert.equal(out.foreground, '#0033cc');
  });

  it('switches the button off with enabled false, and a later layer can switch it back on', () => {
    assert.equal(resolveBackToTop({ enabled: false }).enabled, false);
    assert.equal(resolveBackToTop({ enabled: false }, { enabled: true }).enabled, true);
  });

  it('skips an unknown enum, a bad number and an unsafe CSS value, field by field', () => {
    const out = resolveBackToTop({
      // @ts-expect-error - not a position
      position: 'top-left', icon: 'material-arrow' as never, shape: 'star' as never,
      offset: -4, showAfter: Number.NaN, background: 'red; } body { display:none', radius: '/* x */ 4px',
      label: '   ',
    });
    assert.deepEqual(out, DEFAULT_BACK_TO_TOP);
  });
});

describe('isSafeCssValue: what may reach a custom property', () => {
  it('takes ordinary CSS values', () => {
    for (const v of ['#fff', 'hsl(var(--primary) / 0.5)', '0 4px 12px rgb(0 0 0 / 0.2)', 'var(--font-display), serif']) {
      assert.equal(isSafeCssValue(v), true, v);
    }
  });

  it('refuses a declaration break-out, markup, a comment, an empty or an overlong value', () => {
    for (const v of ['red;', 'a}b', '<b>', '/* x */', '', '   ', 'x'.repeat(161), 4 as unknown as string]) {
      assert.equal(isSafeCssValue(v), false, String(v));
    }
  });
});

describe('backToTopVariables: the config written onto the button', () => {
  it('writes nothing for the neutral fallback, so the site tokens apply', () => {
    assert.deepEqual(backToTopVariables(DEFAULT_BACK_TO_TOP), {});
  });

  it('writes one --back-to-top-* variable per set field, and the offset in px', () => {
    const vars = backToTopVariables({ background: '#000', foreground: '#fff', hoverBackground: '#111', border: '#222', radius: '6px', offset: 30 });
    assert.deepEqual(vars, {
      '--back-to-top-bg': '#000', '--back-to-top-fg': '#fff', '--back-to-top-hover-bg': '#111',
      '--back-to-top-border': '#222', '--back-to-top-radius': '6px', '--back-to-top-offset': '30px',
    });
  });

  it('names every variable under --back-to-top-', () => {
    for (const name of Object.values(BACK_TO_TOP_STYLE_VARIABLES)) assert.match(name, /^--back-to-top-[a-z-]+$/);
  });
});

describe('placement and shape', () => {
  it('sits right by default, left or centred when asked, clear of the side insets', () => {
    assert.deepEqual(horizontalFor('bottom-right'), { right: 'calc(var(--back-to-top-gap, 1rem) + env(safe-area-inset-right, 0px))' });
    assert.deepEqual(horizontalFor('bottom-left'), { left: BACK_TO_TOP_LEFT });
    assert.match(BACK_TO_TOP_LEFT, /env\(safe-area-inset-left, 0px\)/);
    assert.deepEqual(horizontalFor('bottom-center'), { left: '50%' });
  });

  it('rounds a circle and a pill fully, and gives a square the site --radius', () => {
    assert.equal(defaultRadius('circle'), '9999px');
    assert.equal(defaultRadius('pill-with-label'), '9999px');
    assert.equal(defaultRadius('rounded-square'), 'var(--radius, 0.5rem)');
  });

  it('shows no words on the icon-only shapes', () => {
    assert.equal(visibleLabel({ shape: 'circle', label: 'Top' }, 'Site'), null);
    assert.equal(visibleLabel({ shape: 'rounded-square' }, 'Site'), null);
  });

  it('labels the pill "Top" unless the config names a label', () => {
    assert.equal(BACK_TO_TOP_SHORT_LABEL, 'Top');
    assert.equal(visibleLabel({ shape: 'pill-with-label' }, 'Site'), 'Top');
    assert.equal(visibleLabel({ shape: 'pill-with-label', label: 'Up' }, 'Site'), 'Up');
  });

  it("writes the text-arrow's shaft in the site's name unless the config names a label", () => {
    assert.equal(visibleLabel({ shape: 'text-arrow' }, 'Supacharge'), 'Supacharge');
    assert.equal(visibleLabel({ shape: 'text-arrow', label: 'Back up' }, 'Supacharge'), 'Back up');
    assert.equal(visibleLabel({ shape: 'text-arrow' }, '  '), 'Top');
  });
});

describe('the icons: Remixicon paths, inline', () => {
  it('has a 24x24 path for every icon', () => {
    for (const icon of BACK_TO_TOP_ICONS) assert.match(BACK_TO_TOP_ICON_PATHS[icon], /^M[\d.]+ [\d.]+.*Z$/, icon);
  });

  it('draws ri-arrow-up-line by default and ri-arrow-up-s-fill as the text-arrow head', () => {
    assert.ok(BACK_TO_TOP_ICON_PATHS[DEFAULT_BACK_TO_TOP.icon].startsWith('M13.0001 7.82843V20H11.0001'));
    assert.equal(TEXT_ARROW_HEAD_PATH, 'M12 8L18 14H6L12 8Z');
  });
});

describe('floatingLift for the other positions', () => {
  const vw = 390;
  const vh = 844;
  const leftBubble = { top: 772, right: 72, bottom: 828, width: 56, height: 56, left: 16 };
  const rightBubble = { top: 772, right: 374, bottom: 828, width: 56, height: 56, left: 318 };

  it('clears a bubble in the left corner for a left button, and ignores the right one', () => {
    assert.equal(floatingLift([leftBubble], vw, vh, 'bottom-left'), vh - 772 + FLOATING_GAP);
    assert.equal(floatingLift([rightBubble], vw, vh, 'bottom-left'), 0);
  });

  it('ignores a left bubble for the default right button', () => {
    assert.equal(floatingLift([leftBubble], vw, vh), 0);
  });

  it('clears a bar across the bottom middle for a centred button', () => {
    const bar = { top: 780, right: 300, bottom: 830, width: 210, height: 50, left: 90 };
    assert.equal(floatingLift([bar], vw, vh, 'bottom-center'), vh - 780 + FLOATING_GAP);
  });

  it('derives a left edge from right and width when the box has none', () => {
    const { left: _drop, ...noLeft } = leftBubble;
    assert.equal(floatingLift([noLeft], vw, vh, 'bottom-left'), vh - 772 + FLOATING_GAP);
  });
});

describe('resolveThreshold on a short page', () => {
  it('shows after half the scrollable distance when that is under a screen', () => {
    assert.equal(SHORT_PAGE_SHARE, 0.5);
    assert.equal(resolveThreshold(undefined, 900, 400), 200);
  });

  it('keeps one screen on a long page', () => {
    assert.equal(resolveThreshold(undefined, 900, 5000), 900);
  });

  it('ignores the page length when showAfter is configured', () => {
    assert.equal(resolveThreshold(300, 900, 100), 300);
  });

  it('falls back to one screen when the scrollable distance is not known or nothing scrolls', () => {
    assert.equal(resolveThreshold(undefined, 900, Number.NaN), 900);
    assert.equal(resolveThreshold(undefined, 900, 0), 900);
  });
});

describe('the contrast guarantee: at least 3:1 for the glyph on its fill', () => {
  const white = parseColour('#ffffff')!;
  const yellow = parseColour('#FACC14')!;
  const ink = parseColour('rgb(9, 9, 11)')!;

  it('parses hex, rgb() and rgba() in comma and space syntax', () => {
    assert.deepEqual(parseColour('#abc'), [170, 187, 204, 1]);
    assert.deepEqual(parseColour('rgb(1, 2, 3)'), [1, 2, 3, 1]);
    assert.deepEqual(parseColour('rgba(1, 2, 3, 0.5)'), [1, 2, 3, 0.5]);
    assert.deepEqual(parseColour('rgb(1 2 3 / 50%)'), [1, 2, 3, 0.5]);
    assert.equal(parseColour('oklch(0.7 0.1 40)'), null);
    assert.equal(parseColour(undefined), null);
  });

  it('measures the yellow-on-white the hosting sign-in page drew as under 3:1', () => {
    assert.equal(MIN_ICON_CONTRAST, 3);
    assert.ok(contrastRatio(yellow, white) < 2);
    assert.ok(Math.abs(contrastRatio([0, 0, 0, 1], white) - 21) < 1e-9);
  });

  it('keeps a pair that already reaches 3:1', () => {
    assert.equal(contrastTone({ fg: parseColour('#ea580c')!, bg: white }, null), 'as-is');
  });

  it('swaps a light primary on a light ground to the primary as fill with its foreground', () => {
    assert.equal(contrastTone({ fg: yellow, bg: white }, { fg: ink, bg: yellow }), 'solid');
  });

  it('falls back to black or white ink when the solid pair is short too', () => {
    assert.equal(contrastTone({ fg: yellow, bg: white }, { fg: white, bg: yellow }), 'ink');
    assert.equal(inkFor(white), '#000000');
    assert.equal(inkFor(ink), '#ffffff');
    assert.ok(contrastRatio(parseColour(inkFor(yellow))!, yellow) >= MIN_ICON_CONTRAST);
  });

  it('reads a translucent fill over the page behind it', () => {
    const clear = [255, 255, 255, 0] as const;
    assert.equal(contrastTone({ fg: yellow, bg: clear }, null, ink), 'as-is');
    assert.equal(contrastTone({ fg: yellow, bg: clear }, null, white), 'ink');
  });
});
