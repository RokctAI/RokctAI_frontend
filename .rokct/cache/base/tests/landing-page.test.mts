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

// base_sdk 1.32.0: the landing renders server-side (Ray, 2026-09-10: "hero
// i think should be server side if not the whole landing"). Run by
// tests/test_manifest.py against a staged copy of
// components/custom/landing/landing-page.ts beside the real registries
// (page-sections.ts, hero-copy.ts, hero-config.ts, header-menu.ts) with
// the host's config modules stubbed, under node's own test runner with
// type stripping. The rules the client orchestrator applied until 1.31.0
// must give the same answers on the server: a failing module is skipped,
// `meta.renders` decides both the page and the nav, the order is stable,
// the header menu is resolved against the live nav, and the hero copy is
// HERO_CONFIG under the registered overlay.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HEADER_MENU } from './header-menu.ts';
import { HERO_CONFIG } from './hero-config.ts';
import { HERO_COPY } from './hero-copy.ts';
import { LANDING_CONFIG } from './landing-config.ts';
import {
  SECTION_ENTRY_CONTRACT,
  arrangeLandingPage,
  describeMetaProblem,
  dropBackendOnlyActions,
  fallbackSectionMeta,
  isClientReference,
  loadPageSections,
  pageSectionsFor,
  presentSectionsFor,
  resolveHeroConfig,
  resolveHeroWordmark,
  resolveLandingPage,
  type LoadedSection,
} from './landing-page.ts';
import {
  DEFAULT_PAGE_SLOT,
  PAGE_SECTIONS,
  PAGE_SLOTS,
  sectionPageOf,
  type PageSectionMeta,
  type PageSectionModule,
} from './page-sections.ts';

// A section component stub: the arrangement never renders it.
const Section = () => null;

function section(id: string, meta: PageSectionMeta = {}): LoadedSection {
  const nav = meta.nav ?? [{ id, label: id }];
  return {
    id,
    domId: nav[0]?.id ?? meta.anchor ?? id,
    order: meta.order ?? 100,
    nav,
    Component: Section as never,
    meta,
  };
}

/** Runs `fn` with console.error and console.warn captured; answers what each logged. */
async function quietly<T>(
  fn: () => Promise<T>,
): Promise<{ result: T; logged: string[]; warned: string[] }> {
  const logged: string[] = [];
  const warned: string[] = [];
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = (...args: unknown[]) => {
    logged.push(args.map(String).join(' '));
  };
  console.warn = (...args: unknown[]) => {
    warned.push(args.map(String).join(' '));
  };
  try {
    return { result: await fn(), logged, warned };
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
  }
}

const CLIENT_REFERENCE = Symbol.for('react.client.reference');

/**
 * What React makes of `export const meta` in a module that starts with
 * "use client" when the server imports it: a function stamped with the
 * client-reference tag and an id, on which no field of meta exists.
 */
function clientReference(id: string): unknown {
  const ref = function meta() {
    throw new Error(`Attempted to call meta() from the server but meta is on the client (${id}).`);
  };
  Object.defineProperties(ref, {
    $$typeof: { value: CLIENT_REFERENCE },
    $$id: { value: `${id}#meta` },
    $$async: { value: false },
  });
  return ref;
}

/** React's deep client-module proxy: any field but the tag throws "Cannot access ... on the server". */
function throwingReference(id: string): unknown {
  return new Proxy(function meta() {}, {
    get(_target, name) {
      if (name === '$$typeof') return CLIENT_REFERENCE;
      if (name === '$$id') return `${id}#meta`;
      throw new Error(`Cannot access ${String(name)} on the server.`);
    },
    ownKeys() {
      throw new Error('Cannot enumerate a client reference on the server.');
    },
  });
}

const CTX = { plans: [], session: null };

describe('loadPageSections', () => {
  it('loads every entry in registry order, reading meta and defaults', async () => {
    const { result: loaded, warned } = await quietly(() =>
      loadPageSections([
        { id: 'a', load: async () => ({ default: Section, meta: { order: -1, nav: [] } }) },
        { id: 'b', load: async () => ({ default: Section, meta: {} }) },
        { id: 'c', load: async () => ({ default: Section, meta: { anchor: 'c-anchor', nav: [] } }) },
        { id: 'd', load: async () => ({ default: Section, meta: { nav: [{ id: 'd1', label: 'D' }, { id: 'd2', label: 'D2' }] } }) },
      ]),
    );
    assert.deepEqual(loaded.map((s) => [s.id, s.domId, s.order]), [
      ['a', 'a', -1],
      ['b', 'b', 100],
      ['c', 'c-anchor', 100],
      ['d', 'd1', 100],
    ]);
    assert.deepEqual(loaded[1].nav, [{ id: 'b', label: 'b' }]);
    assert.deepEqual(loaded[3].nav.map((n) => n.id), ['d1', 'd2']);
    assert.deepEqual(warned, []);
  });

  it('skips a module that fails to load, logs it, and keeps the rest', async () => {
    const { result, logged } = await quietly(() =>
      loadPageSections([
        { id: 'ok', load: async () => ({ default: Section }) },
        { id: 'broken', load: async () => { throw new Error('boom'); } },
        { id: 'also-ok', load: async () => ({ default: Section }) },
      ]),
    );
    assert.deepEqual(result.map((s) => s.id), ['ok', 'also-ok']);
    assert.equal(logged.length, 1);
    assert.match(logged[0], /section "broken" failed to load/);
  });

  it('skips a module with meta but no default export, logs it, and keeps the rest (1.40.0)', async () => {
    const { result, logged, warned } = await quietly(() =>
      loadPageSections([
        { id: 'ok', load: async () => ({ default: Section, meta: { order: 1 } }) },
        { id: 'no-component', load: async () => ({ meta: { order: 2, nav: [{ id: 'x', label: 'X' }] } } as unknown as PageSectionModule) },
        { id: 'not-a-component', load: async () => ({ default: { render: true }, meta: {} } as unknown as PageSectionModule) },
        { id: 'also-ok', load: async () => ({ default: Section, meta: {} }) },
      ]),
    );
    assert.deepEqual(result.map((s) => s.id), ['ok', 'also-ok']);
    assert.equal(result[0].Component, Section);
    assert.equal(logged.length, 2);
    assert.match(logged[0], /section "no-component" has no component to render: its module has no default export; section skipped/);
    assert.match(logged[1], /section "not-a-component" has no component to render: its module has no default export; section skipped/);
    // The skip is not a meta problem: nothing is warned about, and a proper
    // module beside it renders with its own meta as before.
    assert.deepEqual(warned, []);
    assert.equal(result[0].order, 1);
  });

  it('renders a "use client" module whose meta is a client reference with default settings and one warning', async () => {
    const { result, logged, warned } = await quietly(() =>
      loadPageSections([
        { id: 'plain', load: async () => ({ default: Section, meta: { order: 10, nav: [{ id: 'plain-anchor', label: 'Plain' }], rootClass: 'themed' } }) },
        { id: 'lms-sessions-section', load: async () => ({ default: Section, meta: clientReference('lms-sessions-section') as never }) },
        { id: 'deep-proxy', load: async () => ({ default: Section, meta: throwingReference('deep-proxy') as never }) },
        { id: 'meta-less', load: async () => ({ default: Section }) },
      ]),
    );
    // Nothing is dropped: a shell on a home SDK that has not split its
    // entries yet keeps every section, each with the fallback settings -
    // order 100, the entry id as its DOM id, no nav stop, no rootClass.
    assert.deepEqual(result.map((s) => [s.id, s.domId, s.order, s.nav, s.meta.rootClass]), [
      ['plain', 'plain-anchor', 10, [{ id: 'plain-anchor', label: 'Plain' }], 'themed'],
      ['lms-sessions-section', 'lms-sessions-section', 100, [], undefined],
      ['deep-proxy', 'deep-proxy', 100, [], undefined],
      ['meta-less', 'meta-less', 100, [], undefined],
    ]);
    assert.deepEqual(result.slice(1).map((s) => s.meta), [fallbackSectionMeta(), fallbackSectionMeta(), fallbackSectionMeta()]);
    assert.ok(result.slice(1).every((s) => s.Component === Section), 'the client-reference default export still renders');
    // The arrangement treats them as always present, after the hero, and
    // lists no nav stop for them.
    const page = arrangeLandingPage(result, CTX, null);
    assert.deepEqual(page.flow.map((s) => s.id), ['plain', 'lms-sessions-section', 'deep-proxy', 'meta-less']);
    assert.deepEqual(page.navItems.map((n) => n.id), ['hero', 'plain-anchor', 'footer']);
    assert.equal(page.rootClass, 'themed');
    assert.deepEqual(logged, []);
    assert.equal(warned.length, 3);
    assert.match(warned[0], /^\[landing\] section "lms-sessions-section" renders with default settings \(order 100, id "lms-sessions-section", no floating-nav entry, no rootClass\): its meta export is a client reference/);
    assert.match(warned[0], /starts with "use client"/);
    assert.ok(warned[0].endsWith(SECTION_ENTRY_CONTRACT));
    assert.match(warned[1], /^\[landing\] section "deep-proxy" renders with default settings .*: its meta export is a client reference/);
    assert.match(warned[2], /^\[landing\] section "meta-less" renders with default settings .*: its module exports no meta/);
    for (const line of warned) {
      assert.match(line, /sibling <name>\.client\.tsx/);
      assert.match(line, /meta\.renders\(ctx\) stays pure/);
    }
  });

  it('renders a meta that is not a plain object with default settings, naming what it is', async () => {
    const { result, warned } = await quietly(() =>
      loadPageSections([
        { id: 'stringy', load: async () => ({ default: Section, meta: 'nope' as never }) },
        { id: 'listy', load: async () => ({ default: Section, meta: [] as never }) },
        { id: 'nully', load: async () => ({ default: Section, meta: null as never }) },
        { id: 'classy', load: async () => ({ default: Section, meta: new (class Meta {})() as never }) },
        { id: 'frozen', load: async () => ({ default: Section, meta: Object.freeze({ order: 3 }) }) },
        { id: 'bare', load: async () => ({ default: Section, meta: Object.assign(Object.create(null), { order: 4 }) }) },
      ]),
    );
    assert.deepEqual(result.map((s) => [s.id, s.order, s.nav.length]), [
      ['stringy', 100, 0], ['listy', 100, 0], ['nully', 100, 0], ['classy', 100, 0], ['frozen', 3, 1], ['bare', 4, 1],
    ]);
    assert.deepEqual(
      warned.map((w) => w.split('. ')[0]),
      [
        '[landing] section "stringy" renders with default settings (order 100, id "stringy", no floating-nav entry, no rootClass): its meta export is a string, not a plain object',
        '[landing] section "listy" renders with default settings (order 100, id "listy", no floating-nav entry, no rootClass): its meta export is an array, not a plain object',
        '[landing] section "nully" renders with default settings (order 100, id "nully", no floating-nav entry, no rootClass): its meta export is null, not a plain object',
        '[landing] section "classy" renders with default settings (order 100, id "classy", no floating-nav entry, no rootClass): its meta export is not a plain object (it has a prototype other than Object.prototype)',
      ],
    );
  });
});

describe('describeMetaProblem', () => {
  it('reads a plain meta and names a client reference or a missing one', () => {
    assert.equal(describeMetaProblem(undefined), 'its module exports no meta');
    assert.deepEqual(fallbackSectionMeta(), { order: 100, nav: [] });
    assert.notEqual(fallbackSectionMeta(), fallbackSectionMeta());
    assert.equal(describeMetaProblem({}), null);
    assert.equal(describeMetaProblem({ order: 1, renders: () => true }), null);
    assert.match(describeMetaProblem(clientReference('x'))!, /client reference/);
    assert.match(describeMetaProblem(throwingReference('x'))!, /client reference/);
    assert.match(describeMetaProblem(() => ({}))!, /a function, not a plain object/);
    assert.equal(isClientReference({}), false);
    assert.equal(isClientReference(() => null), false);
    assert.equal(isClientReference({ $$id: 'stamped#meta' }), true);
    assert.equal(isClientReference(clientReference('x')), true);
    assert.equal(isClientReference(throwingReference('x')), true);
    assert.equal(isClientReference('meta'), false);
    assert.equal(isClientReference(null), false);
  });
});

describe('arrangeLandingPage', () => {
  it('asks meta.renders once and drops a turned-down section from the page and the nav', () => {
    let asked = 0;
    const page = arrangeLandingPage(
      [
        section('kept'),
        section('dropped', { renders: () => { asked += 1; return false; } }),
        section('always', { renders: () => true }),
      ],
      CTX,
      null,
    );
    assert.equal(asked, 1);
    assert.deepEqual(page.flow.map((s) => s.id), ['kept', 'always']);
    assert.deepEqual(page.navItems.map((n) => n.id), ['hero', 'kept', 'always', 'footer']);
  });

  it('hands meta.renders the page facts', () => {
    const seen: unknown[] = [];
    const ctx = { plans: [{ name: 'p' }] as never, session: { user: { email: 'x' } } };
    arrangeLandingPage([section('s', { renders: (c) => { seen.push(c); return true; } })], ctx, null);
    assert.deepEqual(seen, [ctx]);
  });

  it('sorts by order, stable, registry order breaking ties', () => {
    const page = arrangeLandingPage(
      [
        section('late', { order: 200 }),
        section('first-100'),
        section('nav', { order: -1, nav: [] }),
        section('second-100'),
        section('early', { order: 10 }),
        section('theme', { order: -2, nav: [] }),
      ],
      CTX,
      null,
    );
    assert.deepEqual(page.overlays.map((s) => s.id), ['theme', 'nav']);
    assert.deepEqual(page.flow.map((s) => s.id), ['early', 'first-100', 'second-100', 'late']);
  });

  it('builds the floating nav as hero, every present entry in page order, footer', () => {
    const page = arrangeLandingPage(
      [
        section('b', { order: 20, nav: [{ id: 'b', label: 'B' }, { id: 'b2', label: 'B two', badge: 'new' }] }),
        section('a', { order: 10 }),
        section('quiet', { nav: [] }),
      ],
      CTX,
      null,
    );
    assert.deepEqual(page.navItems, [
      LANDING_CONFIG.nav.hero,
      { id: 'a', label: 'a' },
      { id: 'b', label: 'B' },
      { id: 'b2', label: 'B two', badge: 'new' },
      LANDING_CONFIG.nav.footer,
    ]);
  });

  it('resolves the header menu against the live nav, so a dropped anchor is not linked', () => {
    const page = arrangeLandingPage(
      [
        section('pricing', { nav: [{ id: 'pricing', label: 'Pricing', badge: 'new' }] }),
        section('faq', { renders: () => false }),
      ],
      CTX,
      {
        anchors: ['pricing', 'faq', 'hero'],
        links: [{ label: 'Docs', href: '/docs' }],
        groups: [
          { id: 'more', label: 'More', items: [{ anchor: 'faq' }] },
          { id: 'product', label: 'Product', items: [{ anchor: 'pricing' }, { label: 'App', href: '/app' }] },
        ],
        actions: [{ label: 'Start', href: '/register' }],
      },
    );
    assert.deepEqual(page.menu.items.map((i) => [i.key, i.href, i.badge]), [
      ['pricing', '#pricing', 'new'],
      ['hero', '#hero', undefined],
      ['/docs', '/docs', undefined],
    ]);
    // The group whose only anchor was dropped is gone; the other keeps both.
    assert.deepEqual(page.menu.groups.map((g) => [g.id, g.items.map((i) => i.href)]), [
      ['product', ['#pricing', '/app']],
    ]);
    assert.deepEqual(page.menu.actions, [{ label: 'Start', href: '/register' }]);
  });

  it('answers an empty menu when nothing is registered', () => {
    const page = arrangeLandingPage([section('a')], CTX, null);
    assert.deepEqual(page.menu, { items: [], groups: [], actions: [], megaLabel: null });
  });

  it('joins every present section\'s rootClass in page order, trimmed; "" when none', () => {
    assert.equal(arrangeLandingPage([section('a')], CTX, null).rootClass, '');
    const page = arrangeLandingPage(
      [
        section('later', { order: 5, rootClass: '  later-class ' }),
        section('theme', { order: -2, nav: [], rootClass: 'acme-landing font-a font-b' }),
        section('blank', { rootClass: '   ' }),
        section('dropped', { rootClass: 'never', renders: () => false }),
      ],
      CTX,
      null,
    );
    assert.equal(page.rootClass, 'acme-landing font-a font-b later-class');
  });
});

describe('resolveLandingPage', () => {
  it('loads the registries, arranges the page and resolves the registered menu', async () => {
    PAGE_SECTIONS.splice(0, PAGE_SECTIONS.length);
    HEADER_MENU.splice(0, HEADER_MENU.length);
    PAGE_SECTIONS.push(
      { id: 'acme-nav', load: async () => ({ default: Section, meta: { order: -1, nav: [], rootClass: 'acme-landing' } }) },
      { id: 'acme-courses', load: async () => ({ default: Section, meta: { nav: [{ id: 'courses', label: 'Courses' }] } }) },
      { id: 'acme-broken', load: async () => { throw new Error('nope'); } },
    );
    HEADER_MENU.push({
      id: 'acme-header-menu',
      load: async () => ({ default: { anchors: ['courses', 'missing'], actions: [{ label: 'Join', href: '/register' }] } }),
    });
    try {
      const { result: page, logged } = await quietly(() => resolveLandingPage(CTX));
      assert.equal(logged.length, 1);
      assert.deepEqual(page.overlays.map((s) => s.id), ['acme-nav']);
      assert.deepEqual(page.flow.map((s) => s.id), ['acme-courses']);
      assert.deepEqual(page.navItems.map((n) => n.id), ['hero', 'courses', 'footer']);
      assert.deepEqual(page.menu.items.map((i) => i.href), ['#courses']);
      assert.deepEqual(page.menu.actions.map((a) => a.href), ['/register']);
      assert.equal(page.rootClass, 'acme-landing');
    } finally {
      PAGE_SECTIONS.splice(0, PAGE_SECTIONS.length);
      HEADER_MENU.splice(0, HEADER_MENU.length);
    }
  });
});

describe('resolveHeroConfig', () => {
  it('is HERO_CONFIG itself with nothing registered', async () => {
    assert.equal(HERO_COPY.length, 0);
    assert.equal(await resolveHeroConfig(), HERO_CONFIG);
    assert.equal(HERO_CONFIG.brand, 'name');
  });

  it('lays the registered copy over HERO_CONFIG, in registry order, keeping what it omits', async () => {
    HERO_COPY.push(
      { id: 'acme-hero', load: async () => ({ default: { headlineSuffix: 'with Acme', trustLine: ['Trusted'], brand: 'stem' } }) },
      { id: 'acme-hero-2', load: async () => ({ default: { headlineSuffix: 'with Acme School' } }) },
    );
    try {
      const hero = await resolveHeroConfig();
      assert.notEqual(hero, HERO_CONFIG);
      assert.equal(hero.headlineSuffix, 'with Acme School');
      assert.deepEqual(hero.trustLine, ['Trusted']);
      assert.equal(hero.brand, 'stem');
      assert.deepEqual(hero.headlineWords, HERO_CONFIG.headlineWords);
      assert.equal(hero.fallbackHref, HERO_CONFIG.fallbackHref);
    } finally {
      HERO_COPY.splice(0, HERO_COPY.length);
    }
  });

  it('keeps the default for a copy module that fails to load', async () => {
    HERO_COPY.push({ id: 'acme-broken', load: async () => { throw new Error('nope'); } });
    try {
      const { result: hero, logged } = await quietly(() => resolveHeroConfig());
      assert.equal(logged.length, 1);
      assert.equal(hero.headlineSuffix, HERO_CONFIG.headlineSuffix);
    } finally {
      HERO_COPY.splice(0, HERO_COPY.length);
    }
  });
});

describe('resolveHeroWordmark', () => {
  it('answers null for "name" and for nothing declared: the host\'s own wordmark', () => {
    assert.equal(resolveHeroWordmark('name', 'acme.school'), null);
    assert.equal(resolveHeroWordmark(undefined, 'acme.school'), null);
  });

  // 1.39.0 (Ray, 2026-09-11): the displayed stem is capitalised; the name
  // beside it (the aria-label and title) is the full domain as declared.
  it('answers the capitalised stem of a dotted name for "stem", with the full name beside it', () => {
    assert.deepEqual(resolveHeroWordmark('stem', 'acme.school'), { text: 'Acme', name: 'acme.school' });
    assert.deepEqual(resolveHeroWordmark('stem', ' acme.school.co '), { text: 'Acme', name: ' acme.school.co ' });
    assert.deepEqual(resolveHeroWordmark('stem', 'supacharge.school'), { text: 'Supacharge', name: 'supacharge.school' });
  });

  it('a stem that already starts upper-case is unchanged', () => {
    assert.deepEqual(resolveHeroWordmark('stem', 'Acme.school'), { text: 'Acme', name: 'Acme.school' });
    assert.deepEqual(resolveHeroWordmark('stem', 'ACME.school'), { text: 'ACME', name: 'ACME.school' });
  });

  it('answers the whole name, untouched, for "stem" when it has no stem', () => {
    assert.deepEqual(resolveHeroWordmark('stem', 'acme'), { text: 'acme', name: 'acme' });
    assert.deepEqual(resolveHeroWordmark('stem', 'Rokct'), { text: 'Rokct', name: 'Rokct' });
    assert.deepEqual(resolveHeroWordmark('stem', '.acme'), { text: '.acme', name: '.acme' });
  });
});

// base_sdk 1.35.0: a "local" shell (composer.json "data": "local") has no
// backend, so the header actions that lead to the sign-in / sign-up routes
// are dropped from the resolved menu; every other mode keeps them all.
describe('dropBackendOnlyActions (1.35.0)', () => {
  const actions = [
    { id: 'login', label: 'Sign in', href: LANDING_CONFIG.loginUrl },
    { id: 'signup', label: 'Get started', href: LANDING_CONFIG.signupUrl, variant: 'primary' as const },
    { id: 'contact', label: 'Contact', href: '/contact' },
  ];

  it('drops the sign-in and sign-up actions in local mode only', () => {
    assert.deepEqual(dropBackendOnlyActions(actions, 'local').map((a) => a.id), ['contact']);
    assert.deepEqual(dropBackendOnlyActions(actions, 'backend').map((a) => a.id), ['login', 'signup', 'contact']);
    assert.deepEqual(dropBackendOnlyActions(actions, 'hybrid').map((a) => a.id), ['login', 'signup', 'contact']);
    assert.deepEqual(dropBackendOnlyActions(actions, undefined).map((a) => a.id), ['login', 'signup', 'contact']);
  });

  it('is applied by the arrangement through ctx.dataMode', () => {
    const menu = { items: [], groups: [], actions };
    const local = arrangeLandingPage([section('a')], { plans: [], dataMode: 'local' }, menu);
    assert.deepEqual(local.menu.actions.map((a) => a.id), ['contact']);
    const backend = arrangeLandingPage([section('a')], { plans: [] }, menu);
    assert.deepEqual(backend.menu.actions.map((a) => a.id), ['login', 'signup', 'contact']);
  });
});

describe('page slots (1.38.0)', () => {
  const menu = { items: [], groups: [], actions: [] };
  /** The arrangement's shape as ids and words, for a byte-for-byte comparison. */
  const shape = (loaded: LoadedSection[]) => {
    const page = arrangeLandingPage(loaded, CTX, menu);
    return {
      overlays: page.overlays.map((s) => s.id),
      flow: page.flow.map((s) => s.id),
      nav: page.navItems.map((n) => `${n.id}:${n.label}`),
      rootClass: page.rootClass,
      menu: page.menu,
    };
  };

  it('names the three slots, landing the default, and reads a missing page as landing', () => {
    assert.deepEqual(PAGE_SLOTS, ['landing', 'about', 'team']);
    assert.equal(DEFAULT_PAGE_SLOT, 'landing');
    assert.equal(sectionPageOf(undefined), 'landing');
    assert.equal(sectionPageOf({}), 'landing');
    assert.equal(sectionPageOf({ page: 'landing' }), 'landing');
    assert.equal(sectionPageOf({ page: 'about' }), 'about');
    assert.equal(sectionPageOf({ page: 'team' }), 'team');
  });

  it('keeps the landing arrangement identical when no section names a page', () => {
    const before = [
      section('nav', { order: -1, nav: [], rootClass: 'acme' }),
      section('b', { order: 20, nav: [{ id: 'b1', label: 'B' }, { id: 'b2', label: 'B2' }] }),
      section('a', { order: 10, anchor: 'a-anchor', nav: [] }),
      section('c', { renders: () => false }),
      section('d'),
    ];
    // The same sections saying "landing" out loud: nothing changes either.
    const explicit = before.map((s) => ({ ...s, meta: { ...s.meta, page: 'landing' as const } }));
    const expected = {
      overlays: ['nav'],
      flow: ['a', 'b', 'd'],
      nav: ['hero:Hero', 'b1:B', 'b2:B2', 'd:d', 'footer:Footer'],
      rootClass: 'acme',
      menu: { items: [], groups: [], actions: [], megaLabel: null },
    };
    assert.deepEqual(shape(before), expected);
    assert.deepEqual(shape(explicit), expected);
  });

  it('keeps a section that names another page off the landing page and out of its nav', () => {
    const loaded = [
      section('founders', { order: 5, nav: [{ id: 'founders', label: 'Founders' }], rootClass: 'about-root', page: 'about' }),
      section('people', { order: 5, page: 'team' }),
      section('hero-copy', { order: 10 }),
    ];
    assert.deepEqual(shape(loaded), {
      overlays: [],
      flow: ['hero-copy'],
      nav: ['hero:Hero', 'hero-copy:hero-copy', 'footer:Footer'],
      rootClass: '',
      menu: { items: [], groups: [], actions: [], megaLabel: null },
    });
  });

  it('presentSectionsFor filters to the page, asks renders, and sorts stably', () => {
    const loaded = [
      section('late', { order: 50, page: 'about' }),
      section('early', { order: 1, page: 'about' }),
      section('tie-first', { order: 10, page: 'about' }),
      section('tie-second', { order: 10, page: 'about' }),
      section('off', { order: 0, page: 'about', renders: (ctx) => ctx.dataMode === 'local' }),
      section('landing-only', { order: 0 }),
      section('team-only', { order: 0, page: 'team' }),
    ];
    assert.deepEqual(presentSectionsFor('about', loaded, CTX).map((s) => s.id), [
      'early', 'tie-first', 'tie-second', 'late',
    ]);
    assert.deepEqual(presentSectionsFor('about', loaded, { plans: [], dataMode: 'local' }).map((s) => s.id), [
      'off', 'early', 'tie-first', 'tie-second', 'late',
    ]);
    assert.deepEqual(presentSectionsFor('team', loaded, CTX).map((s) => s.id), ['team-only']);
    assert.deepEqual(presentSectionsFor('landing', loaded, CTX).map((s) => s.id), ['landing-only']);
  });

  it('pageSectionsFor loads the page\'s sections through the same loader, defaulting the context', async () => {
    const entries = [
      { id: 'about-card', load: async () => ({ default: Section, meta: { order: 20, page: 'about' as const } }) },
      { id: 'about-lead', load: async () => ({ default: Section, meta: { order: 10, page: 'about' as const } }) },
      { id: 'about-plans', load: async () => ({ default: Section, meta: { page: 'about' as const, renders: (ctx: { plans: unknown[] }) => ctx.plans.length > 0 } }) },
      { id: 'landing-thing', load: async () => ({ default: Section, meta: {} }) },
      { id: 'broken', load: async () => { throw new Error('nope'); } },
    ];
    const { result: about, logged } = await quietly(() => pageSectionsFor('about', undefined, entries));
    assert.equal(logged.length, 1);
    assert.deepEqual(about.map((s) => [s.id, s.domId, s.order]), [
      ['about-lead', 'about-lead', 10],
      ['about-card', 'about-card', 20],
    ]);
    const { result: withPlans } = await quietly(() =>
      pageSectionsFor('about', { plans: [{ name: 'p' } as never], session: null }, entries),
    );
    assert.deepEqual(withPlans.map((s) => s.id), ['about-lead', 'about-card', 'about-plans']);
    const { result: team } = await quietly(() => pageSectionsFor('team', undefined, entries));
    assert.deepEqual(team, []);
  });

  it('pageSectionsFor reads the live registry by default', async () => {
    PAGE_SECTIONS.splice(0, PAGE_SECTIONS.length);
    PAGE_SECTIONS.push(
      { id: 'acme-founders', load: async () => ({ default: Section, meta: { page: 'about' } }) },
      { id: 'acme-courses', load: async () => ({ default: Section, meta: {} }) },
    );
    try {
      const { result: about } = await quietly(() => pageSectionsFor('about'));
      assert.deepEqual(about.map((s) => s.id), ['acme-founders']);
      const { result: landing } = await quietly(() => resolveLandingPage(CTX));
      assert.deepEqual(landing.flow.map((s) => s.id), ['acme-courses']);
      assert.deepEqual(landing.navItems.map((n) => n.id), ['hero', 'acme-courses', 'footer']);
    } finally {
      PAGE_SECTIONS.splice(0, PAGE_SECTIONS.length);
    }
  });
});
