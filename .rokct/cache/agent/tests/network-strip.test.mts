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

// agent_sdk 1.13.0: rokct.ai's say over base_sdk 1.23.0's network strip.
// Run by tests/test_manifest.py against a staged copy of
// components/custom/landing/agent-network-strip.ts.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import config from './agent-network-strip.ts';

describe('agent-network-strip: what rokct.ai registers', () => {
  it('puts the strip under the hero on /landing and in the footer row', () => {
    assert.deepEqual(config.placement, { landing: 'afterHero', footer: true });
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
