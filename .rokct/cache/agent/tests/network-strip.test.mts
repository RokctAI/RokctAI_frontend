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
// the strip on /landing (base_sdk 1.27.0); 1.19.0: the sites themselves
// are declared here (base_sdk 1.40.0 carries none). Run by
// tests/test_manifest.py against a staged copy of
// components/custom/landing/agent-network-strip.ts.

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

  it('carries no tracking parameter anywhere: a link is a site origin and nothing more', () => {
    assert.ok(!JSON.stringify(config).includes('?'));
    assert.ok(!JSON.stringify(config).includes('#'));
    assert.ok(!JSON.stringify(config).includes('utm'));
  });
});

describe('agent-network-strip: the sites rokct.ai declares (1.19.0, base_sdk 1.40.0)', () => {
  const sites = config.sites ?? [];
  const byKey = new Map(sites.map((s) => [s.key, s]));

  it('lists the five entries base carried until 1.39.0, in the same order', () => {
    assert.deepEqual(sites.map((s) => s.key), ['rokct', 'supacharge', 'juvo', 'hosting', 'telephony']);
  });

  it('names rokct.ai, supacharge.school and juvo with their origins and their declared brand strings', () => {
    assert.equal(byKey.get('rokct')?.url, 'https://rokct.ai');
    assert.equal(byKey.get('supacharge')?.url, 'https://supacharge.school');
    assert.equal(byKey.get('juvo')?.url, 'https://juvo.app');
    assert.equal(byKey.get('rokct')?.name, 'rokct.ai');
    assert.equal(byKey.get('supacharge')?.name, 'supacharge.school');
    assert.equal(byKey.get('juvo')?.name, 'juvo');
  });

  it('draws rokct.ai and juvo as their own glyphs, light and dark, and supacharge.school as its wordmark', () => {
    assert.equal(byKey.get('rokct')?.logo, 'https://rokct.ai/images/logo_dark.svg');
    assert.equal(byKey.get('rokct')?.logoDark, 'https://rokct.ai/images/logo.svg');
    assert.equal(byKey.get('juvo')?.logo, 'https://juvo.app/images/logo_dark.svg');
    assert.equal(byKey.get('juvo')?.logoDark, 'https://juvo.app/images/logo.svg');
    assert.equal(byKey.get('supacharge')?.wordmark, true);
    assert.equal(byKey.get('supacharge')?.logo, undefined);
  });

  it('keeps hosting and telephony as hidden place-holders with no url', () => {
    for (const pending of ['hosting', 'telephony']) {
      assert.equal(byKey.get(pending)?.url, null, pending);
      assert.equal(byKey.get(pending)?.shown, false, pending);
    }
  });

  it('every url is an https origin with no path, query string or fragment, and every logo is on the site\'s own origin', () => {
    for (const site of sites) {
      if (site.url === null) continue;
      assert.match(site.url, /^https:\/\/[a-z0-9.-]+$/, site.key);
      for (const logo of [site.logo, site.logoDark]) {
        if (logo) assert.ok(logo.startsWith(`${site.url}/`), `${site.key} logo is its own`);
        if (logo) assert.doesNotMatch(logo, /[?#]/, site.key);
      }
    }
  });
});
