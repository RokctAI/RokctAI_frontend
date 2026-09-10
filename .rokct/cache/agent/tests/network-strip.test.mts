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

// agent_sdk 1.13.0: rokct.ai's say over base_sdk 1.23.0's network strip;
// 1.17.0: the landing placement is "section" - the logos marquee carries
// the strip on /landing (base_sdk 1.27.0). Run by tests/test_manifest.py
// against a staged copy of components/custom/landing/agent-network-strip.ts.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import config from './agent-network-strip.ts';

describe('agent-network-strip: what rokct.ai registers', () => {
  it('hands /landing to the logos section and keeps the footer row everywhere else', () => {
    assert.deepEqual(config.placement, { landing: 'section', footer: true });
  });

  it('never names afterHero or beforeFooter: base would draw the strip twice on /landing', () => {
    assert.notEqual(config.placement?.landing, 'afterHero');
    assert.notEqual(config.placement?.landing, 'beforeFooter');
  });

  it('leaves the heading, the order and the hidden keys to base', () => {
    assert.equal(config.heading, undefined);
    assert.equal(config.order, undefined);
    assert.equal(config.hidden, undefined);
  });

  it('names no URL: a link is the site origin from base\'s one list, nothing more', () => {
    assert.ok(!JSON.stringify(config).includes('http'));
    assert.ok(!JSON.stringify(config).includes('?'));
  });
});
