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
// itself, no ad network, no click tracking). Since 1.40.0 base carries NO
// sites: the list below is this file's own fixture - no product, no real
// host - handed to the rules as the `sites` argument, the way a registered
// config's `sites` or a shell's data/network.json reach them. Run by
// tests/test_manifest.py against a staged copy of
// components/custom/landing/network-sites.ts and network-strip.ts beside
// the kernel's tenant-hosts.ts, under node's own test runner with type
// stripping.

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
  withOwnNetworkSites,
} from './network-strip.ts';

const keys = (sites: readonly NetworkSite[]) => sites.map((s) => s.key);

/**
 * The fixture network: what a home SDK's registered config or a shell's
 * data/network.json would declare. Three linkable sites - one with two
 * glyphs, one wordmark, one plain - and two pending ones with no domain
 * yet, kept as hidden entries the way a real list keeps its place-holders.
 */
const SITES: readonly NetworkSite[] = [
  {
    key: 'alpha',
    name: 'alpha.example',
    url: 'https://alpha.example',
    logo: 'https://alpha.example/images/logo_dark.svg',
    logoDark: 'https://alpha.example/images/logo.svg',
  },
  { key: 'beta', name: 'beta.example', url: 'https://beta.example', wordmark: true },
  { key: 'gamma', name: 'gamma', url: 'https://gamma.example' },
  { key: 'pending-one', name: 'Pending one', url: null, shown: false },
  { key: 'pending-two', name: 'Pending two', url: null, shown: false },
];

describe('NETWORK_SITES: base carries no site (1.40.0)', () => {
  it('is empty: site names are brand content, entries come from the home SDK or data/', () => {
    assert.deepEqual([...NETWORK_SITES], []);
    assert.deepEqual(resolveNetworkSites(NETWORK_SITES), []);
  });

  it('with nothing declared the strip resolves to no site and draws on no surface', () => {
    const strip = resolveNetworkStrip(null, 'alpha.example');
    assert.deepEqual(strip.sites, []);
    assert.equal(strip.heading, 'Trusted by');
    for (const surface of ['afterHero', 'beforeFooter', 'section', 'footer', 'none'] as const) {
      for (const onLanding of [true, false]) {
        assert.equal(networkStripRendersAt(strip, surface, onLanding), false, `${surface} onLanding=${onLanding}`);
      }
    }
  });

  it('a placement alone draws nothing either: WHERE without WHICH is no strip', () => {
    const strip = resolveNetworkStrip({ placement: { landing: 'afterHero', footer: true } }, null);
    assert.deepEqual(strip.sites, []);
    assert.equal(networkStripRendersAt(strip, 'afterHero', true), false);
    assert.equal(networkStripRendersAt(strip, 'footer', false), false);
  });
});

describe('the fixture list: the shape a declared list must have', () => {
  it('names three linkable sites and keeps the pending ones hidden with no url', () => {
    const byKey = new Map(SITES.map((s) => [s.key, s]));
    assert.equal(byKey.get('alpha')?.url, 'https://alpha.example');
    assert.equal(byKey.get('beta')?.wordmark, true);
    assert.equal(byKey.get('gamma')?.name, 'gamma');
    for (const pending of ['pending-one', 'pending-two']) {
      assert.equal(byKey.get(pending)?.url, null, pending);
      assert.equal(byKey.get(pending)?.shown, false, pending);
    }
  });

  it('every entry has a unique key and a name; every url is an https origin with no query string', () => {
    const seen = new Set<string>();
    for (const site of SITES) {
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
    const alpha = SITES.find((s) => s.key === 'alpha');
    assert.ok(alpha?.logo && alpha.logoDark);
    const beta = SITES.find((s) => s.key === 'beta');
    assert.equal(beta?.logo, undefined);
  });
});

describe('networkSiteHost: the same normalisation as resolveDisplayHost', () => {
  it('drops the port and a leading www., lower-cases', () => {
    assert.equal(networkSiteHost('https://www.Alpha.EXAMPLE:443/'), 'alpha.example');
    assert.equal(networkSiteHost('https://beta.example'), 'beta.example');
    assert.equal(networkSiteHost('http://localhost:3000'), 'localhost');
  });

  it('answers null for nothing and for a non-URL', () => {
    for (const bad of [null, undefined, '', '   ', 'alpha.example', 'not a url']) {
      assert.equal(networkSiteHost(bad), null, String(bad));
    }
  });
});

describe('resolveNetworkSites: self-exclusion by host', () => {
  it('leaves out the site whose host matches the shell, however the shell spells it', () => {
    for (const self of ['alpha.example', 'www.alpha.example', 'ALPHA.EXAMPLE:443', networkSiteHost('https://www.alpha.example:443/')]) {
      const sites = resolveNetworkSites(SITES, { selfHost: self });
      assert.ok(!keys(sites).includes('alpha'), `self=${self}`);
      assert.deepEqual(keys(sites), ['beta', 'gamma']);
    }
  });

  it("the wordmark site's own shell never lists it", () => {
    const sites = resolveNetworkSites(SITES, { selfHost: 'beta.example' });
    assert.deepEqual(keys(sites), ['alpha', 'gamma']);
  });

  it('with no host every shown site is in, and the hidden-by-list ones still out', () => {
    for (const self of [null, undefined, '']) {
      assert.deepEqual(keys(resolveNetworkSites(SITES, { selfHost: self })), ['alpha', 'beta', 'gamma']);
    }
    assert.deepEqual(keys(resolveNetworkSites(SITES)), ['alpha', 'beta', 'gamma']);
  });

  it('a local or preview host matches nothing and leaves every site in', () => {
    for (const self of ['localhost', '127.0.0.1', 'preview.vercel.app']) {
      assert.deepEqual(keys(resolveNetworkSites(SITES, { selfHost: self })), ['alpha', 'beta', 'gamma']);
    }
  });
});

describe('resolveNetworkSites: order and hidden', () => {
  it('named keys come first in the named order, the rest keep list order', () => {
    assert.deepEqual(keys(resolveNetworkSites(SITES, { order: ['gamma'] })), ['gamma', 'alpha', 'beta']);
    assert.deepEqual(keys(resolveNetworkSites(SITES, { order: ['beta', 'gamma', 'alpha'] })), ['beta', 'gamma', 'alpha']);
    assert.deepEqual(keys(resolveNetworkSites(SITES, { order: ['unknown'] })), ['alpha', 'beta', 'gamma']);
  });

  it('hidden keys are left out; a hidden key that is not in the list is ignored', () => {
    assert.deepEqual(keys(resolveNetworkSites(SITES, { hidden: ['gamma', 'nothing'] })), ['alpha', 'beta']);
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
    for (const site of resolveNetworkSites(SITES, { order: ['gamma'], hidden: [] })) {
      const entry = SITES.find((s) => s.key === site.key);
      assert.equal(site.url, entry?.url);
      assert.ok(!hasTrackingParameters(site.url));
    }
  });
});

describe('resolveNetworkStrip: the defaults and the registered say', () => {
  it('nothing registered over a list: "Trusted by", footer on, landing off, the shell left out', () => {
    const strip = resolveNetworkStrip(null, 'beta.example', SITES);
    assert.equal(strip.heading, DEFAULT_NETWORK_STRIP_HEADING);
    assert.equal(strip.heading, 'Trusted by');
    assert.deepEqual(strip.placement, { landing: 'none', footer: true });
    assert.deepEqual(keys(strip.sites), ['alpha', 'gamma']);
  });

  it('a registered config sets the heading, the order, the hidden keys and the placement', () => {
    const strip = resolveNetworkStrip(
      { heading: ' Runs on alpha ', order: ['gamma'], hidden: ['beta'], placement: { landing: 'afterHero' } },
      'alpha.example',
      SITES,
    );
    assert.equal(strip.heading, 'Runs on alpha');
    assert.deepEqual(keys(strip.sites), ['gamma']);
    assert.deepEqual(strip.placement, { landing: 'afterHero', footer: true });
  });

  it('a blank heading keeps the default', () => {
    assert.equal(resolveNetworkStrip({ heading: '   ' }, null, SITES).heading, 'Trusted by');
  });

  it("a registered config's own sites win over the list argument (1.40.0)", () => {
    const strip = resolveNetworkStrip({ sites: [...SITES] }, 'alpha.example', [
      { key: 'other', name: 'Other', url: 'https://other.example' },
    ]);
    assert.deepEqual(keys(strip.sites), ['beta', 'gamma']);
    // An empty declared list is a declaration too: nothing is drawn.
    assert.deepEqual(resolveNetworkStrip({ sites: [] }, null, SITES).sites, []);
  });

  it('the shell itself, the hidden keys and the order apply to declared sites the same way', () => {
    const strip = resolveNetworkStrip(
      { sites: [...SITES], order: ['gamma'], hidden: ['beta'], placement: { landing: 'section' } },
      'localhost',
    );
    assert.deepEqual(keys(strip.sites), ['gamma', 'alpha']);
    assert.equal(networkStripRendersAt(strip, 'section', true), true);
  });
});

describe('withOwnNetworkSites: registered sites win, else the shell\'s own data, else none', () => {
  const own = { heading: 'Runs beside', sites: [SITES[1]!, SITES[2]!] };

  it('lays the data under a config that declares no sites, and its heading under a config that names none', () => {
    const merged = withOwnNetworkSites({ placement: { footer: false } }, own);
    assert.deepEqual(keys(merged?.sites ?? []), ['beta', 'gamma']);
    assert.equal(merged?.heading, 'Runs beside');
    assert.deepEqual(merged?.placement, { footer: false });
    assert.deepEqual(withOwnNetworkSites(null, own), { sites: own.sites, heading: 'Runs beside' });
  });

  it('a registered heading stays over the data\'s sites', () => {
    assert.equal(withOwnNetworkSites({ heading: 'Trusted by' }, own)?.heading, 'Trusted by');
  });

  it('a config with sites is answered as it is, whatever the data says', () => {
    const config = { sites: [SITES[0]!] };
    assert.equal(withOwnNetworkSites(config, own), config);
    assert.equal(withOwnNetworkSites({ sites: [] }, own)?.sites.length, 0);
  });

  it('nothing to lay under: the config as it was, or null', () => {
    assert.equal(withOwnNetworkSites(null, null), null);
    assert.equal(withOwnNetworkSites(null, { sites: [] }), null);
    const config = { placement: { landing: 'afterHero' as const } };
    assert.equal(withOwnNetworkSites(config, undefined), config);
    assert.equal(withOwnNetworkSites(config, { sites: [] }), config);
  });

  it('never copies a site by reference into the config it answers', () => {
    const merged = withOwnNetworkSites(null, own);
    assert.notEqual(merged?.sites, own.sites);
  });
});

describe('networkStripRendersAt: where the strip draws', () => {
  it('landing "none" (the default) hides both landing surfaces and keeps the footer', () => {
    const strip = resolveNetworkStrip(null, 'alpha.example', SITES);
    assert.equal(networkStripRendersAt(strip, 'afterHero'), false);
    assert.equal(networkStripRendersAt(strip, 'beforeFooter'), false);
    assert.equal(networkStripRendersAt(strip, 'none'), false);
    assert.equal(networkStripRendersAt(strip, 'footer'), true);
  });

  it('a landing placement draws on that surface only', () => {
    const after = resolveNetworkStrip({ placement: { landing: 'afterHero' } }, 'alpha.example', SITES);
    assert.equal(networkStripRendersAt(after, 'afterHero'), true);
    assert.equal(networkStripRendersAt(after, 'beforeFooter'), false);
    const before = resolveNetworkStrip({ placement: { landing: 'beforeFooter' } }, 'alpha.example', SITES);
    assert.equal(networkStripRendersAt(before, 'afterHero'), false);
    assert.equal(networkStripRendersAt(before, 'beforeFooter'), true);
  });

  it('footer false hides the footer surface', () => {
    const strip = resolveNetworkStrip({ placement: { footer: false, landing: 'afterHero' } }, 'alpha.example', SITES);
    assert.equal(networkStripRendersAt(strip, 'footer'), false);
    assert.equal(networkStripRendersAt(strip, 'afterHero'), true);
  });

  it('draws nowhere with no site left', () => {
    const strip = resolveNetworkStrip({ hidden: ['alpha', 'beta', 'gamma'], placement: { landing: 'afterHero' } }, null, SITES);
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
  it('nothing registered over a list: the footer strip draws on every route, the landing route included', () => {
    const strip = resolveNetworkStrip(null, 'alpha.example', SITES);
    assert.equal(networkStripRendersAt(strip, 'footer', false), true);
    assert.equal(networkStripRendersAt(strip, 'footer', true), true);
    assert.equal(networkStripRendersAt(strip, 'section', true), false);
  });

  it('a landing placement makes the footer yield on the landing route only', () => {
    for (const landing of ['afterHero', 'beforeFooter', 'section'] as const) {
      const strip = resolveNetworkStrip({ placement: { landing, footer: true } }, 'alpha.example', SITES);
      assert.equal(networkStripRendersAt(strip, 'footer', true), false, `${landing} on /landing`);
      assert.equal(networkStripRendersAt(strip, 'footer', false), true, `${landing} elsewhere`);
      assert.equal(networkStripRendersAt(strip, 'footer'), true, `${landing} default`);
    }
  });

  it('"section" draws on the section surface alone, and base\'s two landing surfaces stay empty', () => {
    const strip = resolveNetworkStrip({ placement: { landing: 'section' } }, 'alpha.example', SITES);
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
    const strip = resolveNetworkStrip({ placement: { landing: 'none', footer: false } }, 'beta.example', SITES);
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
        { id: 'home', load: async () => ({ default: { heading: 'Runs on alpha' } }) },
        { id: 'late', load: async () => ({ default: { heading: 'never' } }) },
      );
      assert.deepEqual(await loadNetworkStrip(), { heading: 'Runs on alpha' });
    } finally {
      console.error = original;
      NETWORK_STRIP.length = 0;
    }
  });
});
