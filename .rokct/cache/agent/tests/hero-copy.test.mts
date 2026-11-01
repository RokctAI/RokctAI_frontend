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

// agent_sdk 1.24.0: rokct.ai's redesign (Ray, 2026-11-01). Base's hero
// frame is not drawn on rokct.ai, so the hero copy empties what it would
// say beyond the words (1.15.0 to 1.23.0 laid the store marks over its
// badges); the header menu draws the yellow R tile, keeps the collapsing
// brand with its country code, links to the five sections and carries one
// call to action. Run by tests/test_manifest.py against staged copies of
// components/custom/landing/agent-hero-copy.ts and agent-header-menu.ts.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import copy from './agent-hero-copy.ts';
import menu, {
  BRANDING_CODE_STYLE,
  RK_HEADER_ANCHORS,
  RK_MARK,
  TIME_ZONE_CODES,
  brandingCode,
  codeForTimeZone,
} from './agent-header-menu.ts';

describe('agent-hero-copy: base\'s hero frame says nothing extra', () => {
  it('draws no store badge and no trust line, and restates no words', () => {
    assert.deepEqual(copy, { badges: [], trustLine: [] });
  });
});

describe('agent-header-menu: the redesign\'s header (1.24.0)', () => {
  it('draws the yellow R tile this SDK ships, and keeps the collapse at 1500ms', () => {
    const brand = menu.brand;
    assert.ok(brand);
    assert.equal(RK_MARK, '/landing/agent/rk-mark.svg');
    assert.equal(brand.logo, RK_MARK);
    assert.equal(brand.badge, undefined);
    assert.equal(brand.wordmark, undefined);
    const collapse = brand.collapse as { delayMs?: number; code?: () => unknown };
    assert.equal(collapse.delayMs, 1500);
    assert.equal(collapse.code, brandingCode);
  });

  it('links to the five sections, in order, and to nothing else', () => {
    assert.deepEqual(RK_HEADER_ANCHORS, ['ask', 'platform', 'how', 'funding', 'plans']);
    assert.deepEqual(menu.anchors, [...RK_HEADER_ANCHORS]);
    assert.deepEqual(menu.links, []);
    assert.deepEqual(menu.groups, []);
  });

  it('carries one call to action, to sign-up, and no extension button', () => {
    const actions = menu.actions ?? [];
    assert.deepEqual(actions.map((a) => a.id), ['start']);
    assert.equal(actions[0].href, '/register');
    assert.equal(actions[0].variant, 'primary');
    assert.equal(actions[0].label, 'Start with ROKCT');
    assert.equal(actions[0].icon, undefined);
    assert.ok(!JSON.stringify(menu).includes('chrome'));
  });

  it('gives a served time zone its country code, and any other zone none', () => {
    assert.equal(codeForTimeZone('Africa/Johannesburg'), 'ZA');
    assert.equal(codeForTimeZone('Africa/Gaborone'), 'BW');
    assert.equal(codeForTimeZone('America/New_York'), null);
    assert.equal(codeForTimeZone(''), null);
    assert.equal(codeForTimeZone(null), null);
    for (const code of Object.values(TIME_ZONE_CODES)) assert.match(code, /^[A-Z]{2}$/);
  });

  it('draws the code in the superscript style the branding cache would give it', () => {
    assert.equal(BRANDING_CODE_STYLE.fontSize, '0.28em');
    assert.equal(BRANDING_CODE_STYLE.top, '-0.2em');
    // The stub's branding cache is empty (a first visit): the code is the
    // test machine's time zone's, or none for a zone the platform does not serve.
    const code = brandingCode();
    if (code === null) return;
    assert.ok(Object.values(TIME_ZONE_CODES).includes(code.text), code.text);
    assert.deepEqual(code.style, BRANDING_CODE_STYLE);
  });
});
