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

// Behaviour tests for the control-backed tenant host resolver (base_sdk
// 1.20.0). Run by tests/test_manifest.py, which stages src/services next
// to this file with the kernel's extensionless relative imports rewritten
// to `.ts` so node (22.6+, type stripping) can load them directly:
//
//     node --experimental-strip-types --no-warnings --test <staged copy>
//
// Every host name here is invented; no fixture names a real tenant.

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import {
  cachedTenantSite,
  controlTenantHostResolver,
  registerControlTenantHostResolver,
  resetControlTenantHostResolver,
  resetTenantHostCache,
  resolveTenantSiteByHost,
  resolveTenantSiteForRequest,
  setTenantHostFetch,
  TENANT_HOST_RESOLVE_METHOD,
  type TenantHostFetch,
} from './tenant-host-control.ts';
import {
  lookupTenantHost,
  resetTenantHostMap,
  setTenantHostResolver,
} from './tenant-hosts.ts';

const CONTROL = 'https://control.platform-shell.co';
const SITE_URL = 'https://www.platform-shell.co';

interface Call {
  url: string;
  init: RequestInit;
  body: { host?: string };
}

interface FakeControl {
  calls: Call[];
  answers: Record<string, unknown>;
  failWith?: 'network' | number;
  fetch: TenantHostFetch;
}

function fakeControl(answers: Record<string, unknown> = {}): FakeControl {
  const control: FakeControl = {
    calls: [],
    answers,
    fetch: async (url, init) => {
      const body = JSON.parse(String(init.body)) as { host?: string };
      control.calls.push({ url, init, body });
      if (control.failWith === 'network') throw new TypeError('fetch failed');
      if (typeof control.failWith === 'number') {
        return { ok: false, status: control.failWith, json: async () => ({}) };
      }
      const site = body.host ? control.answers[body.host] : undefined;
      return {
        ok: true,
        status: 200,
        json: async () => ({ message: site === undefined ? null : site }),
      };
    },
  };
  return control;
}

function headersOf(map: Record<string, string>): { get(name: string): string | null } {
  const lower = Object.fromEntries(
    Object.entries(map).map(([k, v]) => [k.toLowerCase(), v]),
  );
  return { get: (name) => lower[name.toLowerCase()] ?? null };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function withSilencedConsole<T>(fn: () => Promise<T>): Promise<{ result: T; errors: number }> {
  const original = console.error;
  let errors = 0;
  console.error = () => {
    errors += 1;
  };
  return fn()
    .then((result) => ({ result, errors }))
    .finally(() => {
      console.error = original;
    });
}

beforeEach(() => {
  process.env.ROKCT_BASE_URL = CONTROL;
  process.env.NEXT_PUBLIC_SITE_URL = SITE_URL;
  delete process.env.ROKCT_TENANT_HOSTS;
  delete process.env.ROKCT_TENANT_HOST_LOOKUP;
  delete process.env.ROKCT_TENANT_HOST_TTL_MS;
  delete process.env.ROKCT_TENANT_HOST_NEGATIVE_TTL_MS;
  resetTenantHostMap();
  resetTenantHostCache();
  resetControlTenantHostResolver();
  setTenantHostResolver(undefined);
  setTenantHostFetch(undefined);
});

describe('short-circuits (no network call)', () => {
  it('answers null for every non-public host', async () => {
    const control = fakeControl({ localhost: { site_name: 'never.tenant-one.co' } });
    setTenantHostFetch(control.fetch);
    for (const host of [
      'localhost',
      'localhost:3000',
      '127.0.0.1',
      '127.0.0.1:3000',
      '[::1]:3000',
      '::1',
      '0.0.0.0',
      'shell-git-branch.vercel.app',
      'shell.local',
      'shell.internal',
      '',
      '   ',
    ]) {
      assert.equal(await resolveTenantSiteByHost(host), null, host);
    }
    assert.equal(control.calls.length, 0);
  });

  it("answers null for the configured site's own host and the control host", async () => {
    const control = fakeControl();
    setTenantHostFetch(control.fetch);
    assert.equal(await resolveTenantSiteByHost('platform-shell.co'), null);
    assert.equal(await resolveTenantSiteByHost('www.platform-shell.co:443'), null);
    assert.equal(await resolveTenantSiteByHost('control.platform-shell.co'), null);
    assert.equal(control.calls.length, 0);
  });

  it('answers null with no control site configured', async () => {
    delete process.env.ROKCT_BASE_URL;
    delete process.env.NEXT_PUBLIC_ROKCT_BASE_URL;
    delete process.env.NEXT_PUBLIC_FRAPPE_URL;
    const control = fakeControl({ 'shop.tenant-one.co': { site_name: 'tenant-one.platform-shell.co' } });
    setTenantHostFetch(control.fetch);
    assert.equal(await resolveTenantSiteByHost('shop.tenant-one.co'), null);
    assert.equal(control.calls.length, 0);
    assert.equal(registerControlTenantHostResolver(), false);
  });

  it('answers null with ROKCT_TENANT_HOST_LOOKUP=off', async () => {
    process.env.ROKCT_TENANT_HOST_LOOKUP = 'off';
    const control = fakeControl({ 'shop.tenant-one.co': { site_name: 'tenant-one.platform-shell.co' } });
    setTenantHostFetch(control.fetch);
    assert.equal(await resolveTenantSiteByHost('shop.tenant-one.co'), null);
    assert.equal(control.calls.length, 0);
    assert.equal(registerControlTenantHostResolver(), false);
  });

  it('answers from the ROKCT_TENANT_HOSTS map first, even for a local host', async () => {
    process.env.ROKCT_TENANT_HOSTS = JSON.stringify({
      'localhost:3000': 'tenant-three.platform-shell.co',
      'shop.tenant-four.co': 'http://tenant-four.localhost:8000',
    });
    resetTenantHostMap();
    const control = fakeControl();
    setTenantHostFetch(control.fetch);
    assert.equal(await resolveTenantSiteByHost('localhost:3000'), 'tenant-three.platform-shell.co');
    assert.equal(await resolveTenantSiteByHost('shop.tenant-four.co'), 'tenant-four.localhost');
    assert.equal(control.calls.length, 0);
  });
});

describe('the control lookup', () => {
  it('asks control once for a public host as a guest and caches the site', async () => {
    const control = fakeControl({ 'shop.tenant-one.co': { site_name: 'tenant-one.platform-shell.co' } });
    setTenantHostFetch(control.fetch);
    assert.equal(await resolveTenantSiteByHost('shop.tenant-one.co'), 'tenant-one.platform-shell.co');
    assert.equal(await resolveTenantSiteByHost('shop.tenant-one.co'), 'tenant-one.platform-shell.co');
    assert.equal(control.calls.length, 1);
    const [call] = control.calls;
    assert.equal(call.url, `${CONTROL}/api/v1/method/${TENANT_HOST_RESOLVE_METHOD}`);
    assert.equal(call.init.method, 'POST');
    assert.deepEqual(call.body, { host: 'shop.tenant-one.co' });
    const headers = call.init.headers as Record<string, string>;
    assert.equal(headers['Content-Type'], 'application/json');
    assert.ok(headers['x-trace-id']);
    assert.equal(
      Object.keys(headers).some((k) => k.toLowerCase() === 'authorization'),
      false,
      'a guest lookup carries no credentials',
    );
    assert.equal(cachedTenantSite('shop.tenant-one.co'), 'tenant-one.platform-shell.co');
  });

  it('caches an unknown host negatively and asks again after the negative TTL', async () => {
    process.env.ROKCT_TENANT_HOST_NEGATIVE_TTL_MS = '20';
    const control = fakeControl();
    setTenantHostFetch(control.fetch);
    assert.equal(await resolveTenantSiteByHost('shop.tenant-two.co'), null);
    assert.equal(await resolveTenantSiteByHost('shop.tenant-two.co'), null);
    assert.equal(control.calls.length, 1);
    assert.equal(cachedTenantSite('shop.tenant-two.co'), null);
    await sleep(30);
    assert.equal(cachedTenantSite('shop.tenant-two.co'), undefined);
    control.answers['shop.tenant-two.co'] = { site_name: 'tenant-two.platform-shell.co' };
    assert.equal(await resolveTenantSiteByHost('shop.tenant-two.co'), 'tenant-two.platform-shell.co');
    assert.equal(control.calls.length, 2);
  });

  it('asks again after the positive TTL', async () => {
    process.env.ROKCT_TENANT_HOST_TTL_MS = '20';
    const control = fakeControl({ 'shop.tenant-one.co': { site_name: 'tenant-one.platform-shell.co' } });
    setTenantHostFetch(control.fetch);
    assert.equal(await resolveTenantSiteByHost('shop.tenant-one.co'), 'tenant-one.platform-shell.co');
    await sleep(30);
    assert.equal(await resolveTenantSiteByHost('shop.tenant-one.co'), 'tenant-one.platform-shell.co');
    assert.equal(control.calls.length, 2);
  });

  it('shares one request between concurrent lookups of a host', async () => {
    const control = fakeControl({ 'shop.tenant-one.co': { site_name: 'tenant-one.platform-shell.co' } });
    setTenantHostFetch(control.fetch);
    const answers = await Promise.all([
      resolveTenantSiteByHost('shop.tenant-one.co'),
      resolveTenantSiteByHost('shop.tenant-one.co'),
      resolveTenantSiteByHost('shop.tenant-one.co'),
    ]);
    assert.deepEqual(answers, Array(3).fill('tenant-one.platform-shell.co'));
    assert.equal(control.calls.length, 1);
  });

  it('answers null on a network error, never throws, and logs once', async () => {
    const control = fakeControl();
    control.failWith = 'network';
    setTenantHostFetch(control.fetch);
    const { result, errors } = await withSilencedConsole(async () => [
      await resolveTenantSiteByHost('shop.tenant-one.co'),
      await resolveTenantSiteByHost('shop.tenant-two.co'),
    ]);
    assert.deepEqual(result, [null, null]);
    assert.equal(errors, 1, 'logged once per process');
    assert.equal(control.calls.length, 2);
    // A failure is a negative answer for the negative TTL, no longer.
    assert.equal(cachedTenantSite('shop.tenant-one.co'), null);
  });

  it('answers null on a non-2xx status', async () => {
    const control = fakeControl();
    control.failWith = 503;
    setTenantHostFetch(control.fetch);
    const { result } = await withSilencedConsole(() => resolveTenantSiteByHost('shop.tenant-one.co'));
    assert.equal(result, null);
  });

  it('answers null for a malformed answer, and for the control site itself', async () => {
    const control = fakeControl({
      'a.tenant-five.co': { site_name: 'not a host' },
      'b.tenant-five.co': { site_name: '' },
      'c.tenant-five.co': { site_name: { nested: true } },
      'd.tenant-five.co': { other: 'field' },
      'e.tenant-five.co': 'tenant-five.platform-shell.co',
      'f.tenant-five.co': { site_name: 'control.platform-shell.co' },
      'g.tenant-five.co': { site_name: 'https://control.platform-shell.co/' },
    });
    setTenantHostFetch(control.fetch);
    for (const host of ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((p) => `${p}.tenant-five.co`)) {
      assert.equal(await resolveTenantSiteByHost(host), null, host);
    }
  });

  it('accepts a site given as an origin and answers its host', async () => {
    const control = fakeControl({
      'shop.tenant-six.co': { site_name: 'https://Tenant-Six.platform-shell.co/' },
    });
    setTenantHostFetch(control.fetch);
    assert.equal(await resolveTenantSiteByHost('shop.tenant-six.co'), 'tenant-six.platform-shell.co');
  });
});

describe('resolveTenantSiteForRequest (headers)', () => {
  it('reads x-forwarded-host first value, then host; strips port and www., lower-cases', async () => {
    const control = fakeControl({
      'shop.tenant-one.co': { site_name: 'tenant-one.platform-shell.co' },
      'shop.tenant-two.co': { site_name: 'tenant-two.platform-shell.co' },
    });
    setTenantHostFetch(control.fetch);
    assert.equal(
      await resolveTenantSiteForRequest(
        headersOf({
          'X-Forwarded-Host': 'WWW.Shop.Tenant-One.co:443, inner.proxy.internal',
          Host: 'shop.tenant-two.co',
        }),
      ),
      'tenant-one.platform-shell.co',
    );
    assert.equal(
      await resolveTenantSiteForRequest(headersOf({ Host: 'www.Shop.Tenant-Two.co:8443' })),
      'tenant-two.platform-shell.co',
    );
    assert.deepEqual(
      control.calls.map((c) => c.body.host),
      ['shop.tenant-one.co', 'shop.tenant-two.co'],
    );
  });

  it('falls back to host when x-forwarded-host is blank, and answers null with no host', async () => {
    const control = fakeControl({ 'shop.tenant-one.co': { site_name: 'tenant-one.platform-shell.co' } });
    setTenantHostFetch(control.fetch);
    assert.equal(
      await resolveTenantSiteForRequest(headersOf({ 'x-forwarded-host': ' ', host: 'shop.tenant-one.co' })),
      'tenant-one.platform-shell.co',
    );
    assert.equal(await resolveTenantSiteForRequest(headersOf({})), null);
    assert.equal(await resolveTenantSiteForRequest(null), null);
    assert.equal(await resolveTenantSiteForRequest(headersOf({ host: 'localhost:3000' })), null);
    assert.equal(control.calls.length, 1);
  });
});

describe('the kernel wiring', () => {
  it('registers the control resolver so lookupTenantHost resolves a custom domain to its origin', async () => {
    const control = fakeControl({ 'shop.tenant-one.co': { site_name: 'tenant-one.platform-shell.co' } });
    setTenantHostFetch(control.fetch);
    assert.equal(await lookupTenantHost('shop.tenant-one.co'), undefined, 'nothing registered yet');
    assert.equal(registerControlTenantHostResolver(), true);
    assert.equal(registerControlTenantHostResolver(), true, 'idempotent');
    assert.equal(await lookupTenantHost('shop.tenant-one.co:443'), 'https://tenant-one.platform-shell.co');
    assert.equal(await lookupTenantHost('shop.unknown-seven.co'), undefined);
    assert.equal(await lookupTenantHost('localhost:3000'), undefined);
    assert.equal(control.calls.length, 2);
    assert.equal(await controlTenantHostResolver('shop.tenant-one.co'), 'tenant-one.platform-shell.co');
    assert.equal(await controlTenantHostResolver('shop.unknown-seven.co'), undefined);
  });
});
