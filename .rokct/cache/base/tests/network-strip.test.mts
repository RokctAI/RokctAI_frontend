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

// base_sdk 1.23.0: the network strip (Ray, 2026-09-09: a clickable logo
// strip of the other products under "Trusted by", on every shell minus
// itself, no ad network, no click tracking). Run by tests/test_manifest.py
// against a staged copy of components/custom/landing/network-sites.ts and
// network-strip.ts beside the kernel's tenant-hosts.ts, under node's own
// test runner with type stripping.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  NETWORK_SITES,
  hasTrackingParameters,
  networkSiteHost,
  resolveNetworkSites,
  type NetworkSite,
} from './network-sites.ts';
import {
  DEFAULT_NETWORK_STRIP_HEADING,
  LANDING_ROUTE,
  NETWORK_STRIP,
  isLandingRoute,
  loadNetworkStrip,
  networkStripRendersAt,
  resolveNetworkStrip,
} from './network-strip.ts';

const keys = (sites: readonly NetworkSite[]) => sites.map((s) => s.key);

describe('NETWORK_SITES: the list', () => {
  it('names rokct.ai, Supacharge and juvo with their origins, hosting and telephony without', () => {
    const byKey = new Map(NETWORK_SITES.map((s) => [s.key, s]));
    assert.equal(byKey.get('rokct')?.url, 'https://rokct.ai');
    assert.equal(byKey.get('supacharge')?.url, 'https://supacharge.app');
    assert.equal(byKey.get('supacharge')?.wordmark, true);
    assert.equal(byKey.get('juvo')?.url, 'https://juvo.app');
    for (const pending of ['hosting', 'telephony']) {
      assert.equal(byKey.get(pending)?.url, null, pending);
      assert.equal(byKey.get(pending)?.shown, false, pending);
    }
  });

  it('every entry has a unique key and a name; every url is an https origin with no query string', () => {
    const seen = new Set<string>();
    for (const site of NETWORK_SITES) {
      assert.ok(site.key.trim(), 'key');
      assert.ok(!seen.has(site.key), `duplicate key ${site.key}`);
      seen.add(site.key);
      assert.ok(site.name.trim(), `name of ${site.key}`);
      if (site.url === null) {
        assert.equal(site.shown, false, `${site.key} has no url and must be hidden`);
        continue;
      }
      assert.match(site.url, /^https:\/\/[a-z0-9.-]+$/, `${site.key} url is an origin`);
      assert.ok(!hasTrackingParameters(site.url), `${site.key} url carries no parameters`);
      for (const logo of [site.logo, site.logoDark]) {
        if (logo) assert.ok(!hasTrackingParameters(logo), `${site.key} logo carries no parameters`);
      }
    }
  });

  it('a site is drawn as a logo only when it has one and is not a wordmark', () => {
    const rokct = NETWORK_SITES.find((s) => s.key === 'rokct');
    assert.ok(rokct?.logo && rokct.logoDark);
    const supacharge = NETWORK_SITES.find((s) => s.key === 'supacharge');
    assert.equal(supacharge?.logo, undefined);
  });
});

describe('networkSiteHost: the same normalisation as resolveDisplayHost', () => {
  it('drops the port and a leading www., lower-cases', () => {
    assert.equal(networkSiteHost('https://www.Rokct.AI:443/'), 'rokct.ai');
    assert.equal(networkSiteHost('https://supacharge.app'), 'supacharge.app');
    assert.equal(networkSiteHost('http://localhost:3000'), 'localhost');
  });

  it('answers null for nothing and for a non-URL', () => {
    for (const bad of [null, undefined, '', '   ', 'rokct.ai', 'not a url']) {
      assert.equal(networkSiteHost(bad), null, String(bad));
    }
  });
});

describe('resolveNetworkSites: self-exclusion by host', () => {
  it('leaves out the site whose host matches the shell, however the shell spells it', () => {
    for (const self of ['rokct.ai', 'www.rokct.ai', 'ROKCT.AI:443', networkSiteHost('https://www.rokct.ai:443/')]) {
      const sites = resolveNetworkSites(NETWORK_SITES, { selfHost: self });
      assert.ok(!keys(sites).includes('rokct'), `self=${self}`);
      assert.deepEqual(keys(sites), ['supacharge', 'juvo']);
    }
  });

  it("supacharge's shell never lists Supacharge", () => {
    const sites = resolveNetworkSites(NETWORK_SITES, { selfHost: 'supacharge.app' });
    assert.deepEqual(keys(sites), ['rokct', 'juvo']);
  });

  it('with no host every shown site is in, and the hidden-by-list ones still out', () => {
    for (const self of [null, undefined, '']) {
      assert.deepEqual(keys(resolveNetworkSites(NETWORK_SITES, { selfHost: self })), ['rokct', 'supacharge', 'juvo']);
    }
    assert.deepEqual(keys(resolveNetworkSites(NETWORK_SITES)), ['rokct', 'supacharge', 'juvo']);
  });

  it('a local or preview host matches nothing and leaves every site in', () => {
    for (const self of ['localhost', '127.0.0.1', 'preview.vercel.app']) {
      assert.deepEqual(keys(resolveNetworkSites(NETWORK_SITES, { selfHost: self })), ['rokct', 'supacharge', 'juvo']);
    }
  });
});

describe('resolveNetworkSites: order and hidden', () => {
  it('named keys come first in the named order, the rest keep list order', () => {
    assert.deepEqual(keys(resolveNetworkSites(NETWORK_SITES, { order: ['juvo'] })), ['juvo', 'rokct', 'supacharge']);
    assert.deepEqual(keys(resolveNetworkSites(NETWORK_SITES, { order: ['supacharge', 'juvo', 'rokct'] })), ['supacharge', 'juvo', 'rokct']);
    assert.deepEqual(keys(resolveNetworkSites(NETWORK_SITES, { order: ['unknown'] })), ['rokct', 'supacharge', 'juvo']);
  });

  it('hidden keys are left out; a hidden key that is not in the list is ignored', () => {
    assert.deepEqual(keys(resolveNetworkSites(NETWORK_SITES, { hidden: ['juvo', 'nothing'] })), ['rokct', 'supacharge']);
  });

  it('a site with a tracking parameter in its url is never drawn', () => {
    const tainted: NetworkSite[] = [
      { key: 'a', name: 'A', url: 'https://a.example?utm_source=strip' },
      { key: 'b', name: 'B', url: 'https://b.example#ref' },
      { key: 'c', name: 'C', url: 'https://c.example' },
    ];
    assert.deepEqual(keys(resolveNetworkSites(tainted)), ['c']);
  });

  it('never adds a parameter: every resolved url is the entry url, verbatim', () => {
    for (const site of resolveNetworkSites(NETWORK_SITES, { order: ['juvo'], hidden: [] })) {
      const entry = NETWORK_SITES.find((s) => s.key === site.key);
      assert.equal(site.url, entry?.url);
      assert.ok(!hasTrackingParameters(site.url));
    }
  });
});

describe('resolveNetworkStrip: the defaults and the registered say', () => {
  it('nothing registered: "Trusted by", footer on, landing off, the shell left out', () => {
    const strip = resolveNetworkStrip(null, 'supacharge.app');
    assert.equal(strip.heading, DEFAULT_NETWORK_STRIP_HEADING);
    assert.equal(strip.heading, 'Trusted by');
    assert.deepEqual(strip.placement, { landing: 'none', footer: true });
    assert.deepEqual(keys(strip.sites), ['rokct', 'juvo']);
  });

  it('a registered config sets the heading, the order, the hidden keys and the placement', () => {
    const strip = resolveNetworkStrip(
      { heading: ' Runs on rokct ', order: ['juvo'], hidden: ['supacharge'], placement: { landing: 'afterHero' } },
      'rokct.ai',
    );
    assert.equal(strip.heading, 'Runs on rokct');
    assert.deepEqual(keys(strip.sites), ['juvo']);
    assert.deepEqual(strip.placement, { landing: 'afterHero', footer: true });
  });

  it('a blank heading keeps the default', () => {
    assert.equal(resolveNetworkStrip({ heading: '   ' }, null).heading, 'Trusted by');
  });
});

describe('networkStripRendersAt: where the strip draws', () => {
  it('landing "none" (the default) hides both landing surfaces and keeps the footer', () => {
    const strip = resolveNetworkStrip(null, 'rokct.ai');
    assert.equal(networkStripRendersAt(strip, 'afterHero'), false);
    assert.equal(networkStripRendersAt(strip, 'beforeFooter'), false);
    assert.equal(networkStripRendersAt(strip, 'none'), false);
    assert.equal(networkStripRendersAt(strip, 'footer'), true);
  });

  it('a landing placement draws on that surface only', () => {
    const after = resolveNetworkStrip({ placement: { landing: 'afterHero' } }, 'rokct.ai');
    assert.equal(networkStripRendersAt(after, 'afterHero'), true);
    assert.equal(networkStripRendersAt(after, 'beforeFooter'), false);
    const before = resolveNetworkStrip({ placement: { landing: 'beforeFooter' } }, 'rokct.ai');
    assert.equal(networkStripRendersAt(before, 'afterHero'), false);
    assert.equal(networkStripRendersAt(before, 'beforeFooter'), true);
  });

  it('footer false hides the footer surface', () => {
    const strip = resolveNetworkStrip({ placement: { footer: false, landing: 'afterHero' } }, 'rokct.ai');
    assert.equal(networkStripRendersAt(strip, 'footer'), false);
    assert.equal(networkStripRendersAt(strip, 'afterHero'), true);
  });

  it('draws nowhere with no site left', () => {
    const strip = resolveNetworkStrip({ hidden: ['rokct', 'supacharge', 'juvo'], placement: { landing: 'afterHero' } }, null);
    assert.deepEqual(strip.sites, []);
    for (const surface of ['afterHero', 'beforeFooter', 'footer'] as const) {
      assert.equal(networkStripRendersAt(strip, surface), false, surface);
    }
  });
});

describe('isLandingRoute: the one route with landing surfaces', () => {
  it('is /landing, trailing slashes ignored', () => {
    assert.equal(LANDING_ROUTE, '/landing');
    for (const path of ['/landing', '/landing/', '/landing//']) {
      assert.equal(isLandingRoute(path), true, path);
    }
  });

  it('is no other route, not the routes under it, not null', () => {
    for (const path of [null, undefined, '', '/', '/landing/x', '/opportunities/grants/abc', '/careers', '/landingpage']) {
      assert.equal(isLandingRoute(path), false, String(path));
    }
  });
});

describe('networkStripRendersAt: once per page (1.27.0)', () => {
  it('nothing registered: the footer strip draws on every route, the landing route included', () => {
    const strip = resolveNetworkStrip(null, 'rokct.ai');
    assert.equal(networkStripRendersAt(strip, 'footer', false), true);
    assert.equal(networkStripRendersAt(strip, 'footer', true), true);
    assert.equal(networkStripRendersAt(strip, 'section', true), false);
  });

  it('a landing placement makes the footer yield on the landing route only', () => {
    for (const landing of ['afterHero', 'beforeFooter', 'section'] as const) {
      const strip = resolveNetworkStrip({ placement: { landing, footer: true } }, 'rokct.ai');
      assert.equal(networkStripRendersAt(strip, 'footer', true), false, `${landing} on /landing`);
      assert.equal(networkStripRendersAt(strip, 'footer', false), true, `${landing} elsewhere`);
      assert.equal(networkStripRendersAt(strip, 'footer'), true, `${landing} default`);
    }
  });

  it('"section" draws on the section surface alone, and base\'s two landing surfaces stay empty', () => {
    const strip = resolveNetworkStrip({ placement: { landing: 'section' } }, 'rokct.ai');
    assert.deepEqual(strip.placement, { landing: 'section', footer: true });
    assert.equal(networkStripRendersAt(strip, 'section'), true);
    assert.equal(networkStripRendersAt(strip, 'section', true), true);
    assert.equal(networkStripRendersAt(strip, 'afterHero'), false);
    assert.equal(networkStripRendersAt(strip, 'beforeFooter'), false);
    assert.equal(networkStripRendersAt(strip, 'none'), false);
    // The section is on the landing page, so the footer yields there.
    assert.equal(networkStripRendersAt(strip, 'footer', true), false);
    assert.equal(networkStripRendersAt(strip, 'footer', false), true);
  });

  it('footer false stays off everywhere, and the landing route never turns a surface on', () => {
    const strip = resolveNetworkStrip({ placement: { landing: 'none', footer: false } }, 'supacharge.app');
    for (const onLanding of [true, false]) {
      for (const surface of ['afterHero', 'beforeFooter', 'section', 'footer', 'none'] as const) {
        assert.equal(networkStripRendersAt(strip, surface, onLanding), false, `${surface} onLanding=${onLanding}`);
      }
    }
  });
});

describe('loadNetworkStrip: the registry', () => {
  it('answers null with nothing registered, then the first entry that loads', async () => {
    assert.equal(NETWORK_STRIP.length, 0);
    assert.equal(await loadNetworkStrip(), null);
    const original = console.error;
    console.error = () => {};
    try {
      NETWORK_STRIP.push(
        { id: 'broken', load: async () => { throw new Error('nope'); } },
        { id: 'home', load: async () => ({ default: { heading: 'Runs on rokct' } }) },
        { id: 'late', load: async () => ({ default: { heading: 'never' } }) },
      );
      assert.deepEqual(await loadNetworkStrip(), { heading: 'Runs on rokct' });
    } finally {
      console.error = original;
      NETWORK_STRIP.length = 0;
    }
  });
});
