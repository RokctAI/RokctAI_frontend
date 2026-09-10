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

// Behaviour tests for platformCall's one retry on the tenant's other
// origin and the credential guard over the pair (base_sdk 1.30.0). Run
// by tests/test_manifest.py, which stages src/services next to this file
// with the kernel's extensionless relative imports rewritten to `.ts`
// and session.ts's host seam (`server-only`, `@/app/lib/session`) stood
// in by a null session, so node (22.6+, type stripping) loads them:
//
//     node --experimental-strip-types --no-warnings --test <staged copy>
//
// Every host name here is invented; no fixture names a real tenant.

import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { PLATFORM_GATEWAY_PATH } from './gateway-constants.ts';
import { platformCall, PlatformGatewayError } from './platform-gateway.ts';
import {
  registerControlTenantHostResolver,
  resetControlTenantHostResolver,
  resetTenantHostCache,
  resolveTenantHost,
  setTenantHostFetch,
  type TenantHostFetch,
} from './tenant-host-control.ts';
import { resetTenantHostMap, setTenantHostResolver } from './tenant-hosts.ts';

const CONTROL = 'https://control.platform-shell.co';
const SITE_URL = 'https://www.platform-shell.co';
const SITE = 'tenant-one.platform-shell.co';
const SITE_ORIGIN = `https://${SITE}`;
const BACKEND = 'https://platform.acme.school';
const SHELL_HOST = 'acme.school';
const OTHER_ORIGIN = 'https://tenant-two.platform-shell.co';

/** What one origin answers, attempt by attempt: a status, or a failure. */
type Script = Array<number | 'network' | 'abort'>;

interface Sent {
  url: string;
  origin: string;
  init: RequestInit;
}

interface FakeGateway {
  sent: Sent[];
  fetch: typeof fetch;
}

function fakeGateway(scripts: Record<string, Script>): FakeGateway {
  const remaining: Record<string, Script> = Object.fromEntries(
    Object.entries(scripts).map(([k, v]) => [k, [...v]]),
  );
  const gateway: FakeGateway = {
    sent: [],
    fetch: (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const origin = new URL(url).origin;
      gateway.sent.push({ url, origin, init: init ?? {} });
      const step = remaining[origin]?.shift();
      if (step === undefined) throw new Error(`unscripted call to ${origin}`);
      if (step === 'network') throw new TypeError('fetch failed');
      if (step === 'abort') {
        await new Promise<void>((resolve) => {
          const signal = init?.signal;
          if (signal?.aborted) resolve();
          else signal?.addEventListener('abort', () => resolve(), { once: true });
        });
        const e = new Error('This operation was aborted');
        e.name = 'AbortError';
        throw e;
      }
      if (step >= 400) return new Response(`status ${step}`, { status: step });
      return new Response(JSON.stringify({ message: { answered_by: origin } }), {
        status: step,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch,
  };
  return gateway;
}

const controlFetch: TenantHostFetch = async (_url, init) => {
  const { host } = JSON.parse(String(init.body)) as { host?: string };
  return {
    ok: true,
    status: 200,
    json: async () => ({
      message: host === SHELL_HOST ? { site_name: SITE, backend_url: BACKEND } : null,
    }),
  };
};

function requestOn(host: string): { headers: { get(name: string): string | null } } {
  return { headers: { get: (name) => (name.toLowerCase() === 'host' ? host : null) } };
}

const signedIn = (siteName: string) => ({
  user: { siteName, apiKey: 'key-one', apiSecret: 'secret-one' },
});

function authorizationOf(sent: Sent): string | undefined {
  const headers = sent.init.headers as Record<string, string>;
  return headers.Authorization ?? headers.authorization;
}

/** Resolves the shell host once so the process knows the pair. */
async function learnPair(): Promise<void> {
  const found = await resolveTenantHost(SHELL_HOST);
  assert.deepEqual(found, { siteName: SITE, backendUrl: BACKEND });
}

const realFetch = globalThis.fetch;
const realWarn = console.warn;
const realError = console.error;

beforeEach(() => {
  process.env.ROKCT_BASE_URL = CONTROL;
  process.env.NEXT_PUBLIC_SITE_URL = SITE_URL;
  delete process.env.ROKCT_TENANT_HOSTS;
  delete process.env.ROKCT_TENANT_HOST_LOOKUP;
  resetTenantHostMap();
  resetTenantHostCache();
  resetControlTenantHostResolver();
  setTenantHostResolver(undefined);
  setTenantHostFetch(controlFetch);
  assert.equal(registerControlTenantHostResolver(), true);
  console.warn = () => {};
  console.error = () => {};
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.warn = realWarn;
  console.error = realError;
});

describe('a guest call on the tenant\'s shell domain (resolved to its backend origin)', () => {
  it('retries once on the site name after a network error, with the same request', async () => {
    const gateway = fakeGateway({ [BACKEND]: ['network'], [SITE_ORIGIN]: [200] });
    globalThis.fetch = gateway.fetch;
    const result = await platformCall<{ answered_by: string }>(
      'api.lms.get_courses',
      { page: 1 },
      { request: requestOn(SHELL_HOST), session: null },
    );
    assert.deepEqual(result, { answered_by: SITE_ORIGIN });
    assert.deepEqual(
      gateway.sent.map((s) => s.url),
      [`${BACKEND}${PLATFORM_GATEWAY_PATH}`, `${SITE_ORIGIN}${PLATFORM_GATEWAY_PATH}`],
    );
    const [first, second] = gateway.sent;
    assert.equal(first.init.method, 'POST');
    assert.equal(second.init.method, 'POST');
    assert.equal(second.init.body, first.init.body, 'the same body goes out again');
    assert.deepEqual(JSON.parse(String(second.init.body)), {
      cmd: 'api.lms.get_courses',
      payload: { page: 1 },
    });
    assert.equal(authorizationOf(first), undefined, 'a guest sends no credentials');
    assert.equal(authorizationOf(second), undefined);
  });

  for (const status of [502, 503, 504]) {
    it(`retries once on the site name after a ${status}`, async () => {
      const gateway = fakeGateway({ [BACKEND]: [status], [SITE_ORIGIN]: [200] });
      globalThis.fetch = gateway.fetch;
      const result = await platformCall('api.lms.get_courses', undefined, {
        request: requestOn(SHELL_HOST),
        session: null,
      });
      assert.deepEqual(result, { answered_by: SITE_ORIGIN });
      assert.deepEqual(gateway.sent.map((s) => s.origin), [BACKEND, SITE_ORIGIN]);
    });
  }

  for (const status of [400, 401, 403, 404, 429, 500]) {
    it(`never retries on a ${status}: that is the tenant's answer`, async () => {
      const gateway = fakeGateway({ [BACKEND]: [status, status], [SITE_ORIGIN]: [200] });
      globalThis.fetch = gateway.fetch;
      const options = { request: requestOn(SHELL_HOST), session: null };
      assert.equal(await platformCall('api.lms.get_courses', undefined, options), null);
      assert.deepEqual(gateway.sent.map((s) => s.origin), [BACKEND]);
      await assert.rejects(
        platformCall('api.lms.get_courses', undefined, { ...options, throwOnError: true }),
        (e: unknown) =>
          e instanceof PlatformGatewayError && e.reason === 'http_error' && e.status === status,
      );
      assert.equal(gateway.sent.length, 2, 'one attempt per call');
    });
  }

  it('makes exactly two attempts, never a third, and reports the second outcome', async () => {
    const gateway = fakeGateway({ [BACKEND]: ['network', 502], [SITE_ORIGIN]: ['network', 404] });
    globalThis.fetch = gateway.fetch;
    const options = { request: requestOn(SHELL_HOST), session: null };
    assert.equal(await platformCall('api.lms.get_courses', undefined, options), null);
    assert.deepEqual(gateway.sent.map((s) => s.origin), [BACKEND, SITE_ORIGIN]);
    await assert.rejects(
      platformCall('api.lms.get_courses', undefined, { ...options, throwOnError: true }),
      (e: unknown) =>
        e instanceof PlatformGatewayError && e.reason === 'http_error' && e.status === 404,
      'the alternate\'s 404 is final',
    );
    assert.deepEqual(gateway.sent.map((s) => s.origin), [BACKEND, SITE_ORIGIN, BACKEND, SITE_ORIGIN]);
  });

  it('throws network_error when both origins fail at the network level', async () => {
    const gateway = fakeGateway({ [BACKEND]: ['network'], [SITE_ORIGIN]: ['network'] });
    globalThis.fetch = gateway.fetch;
    await assert.rejects(
      platformCall('api.lms.get_courses', undefined, {
        request: requestOn(SHELL_HOST),
        session: null,
        throwOnError: true,
      }),
      (e: unknown) => e instanceof PlatformGatewayError && e.reason === 'network_error',
    );
    assert.equal(gateway.sent.length, 2);
  });

  it('gives the retry its own timeout after the first attempt timed out', async () => {
    const gateway = fakeGateway({ [BACKEND]: ['abort'], [SITE_ORIGIN]: [200] });
    globalThis.fetch = gateway.fetch;
    const result = await platformCall('api.lms.get_courses', undefined, {
      request: requestOn(SHELL_HOST),
      session: null,
      timeout: 20,
    });
    assert.deepEqual(result, { answered_by: SITE_ORIGIN });
    const [first, second] = gateway.sent;
    assert.equal(first.init.signal?.aborted, true, 'the first attempt was cut off');
    assert.equal(second.init.signal?.aborted, false, 'the retry ran on a fresh signal');
  });

  it('keeps the query string on the retry of a GET', async () => {
    const gateway = fakeGateway({ [BACKEND]: [503], [SITE_ORIGIN]: [200] });
    globalThis.fetch = gateway.fetch;
    const result = await platformCall('api.lms.get_courses', { page: 2 }, {
      request: requestOn(SHELL_HOST),
      session: null,
      method: 'GET',
      requireAuth: false,
    });
    assert.deepEqual(result, { answered_by: SITE_ORIGIN });
    const [first, second] = gateway.sent;
    assert.equal(first.init.method, 'GET');
    assert.equal(new URL(first.url).search, new URL(second.url).search);
    assert.equal(new URL(second.url).searchParams.get('cmd'), 'api.lms.get_courses');
    assert.equal(new URL(second.url).searchParams.get('payload'), JSON.stringify({ page: 2 }));
  });
});

describe('a signed-in call on the site name (the session\'s site)', () => {
  it('retries once on the backend origin, credentials included, once the pair is known', async () => {
    await learnPair();
    const gateway = fakeGateway({ [SITE_ORIGIN]: ['network'], [BACKEND]: [200] });
    globalThis.fetch = gateway.fetch;
    const result = await platformCall('api.lms.get_courses', undefined, {
      session: signedIn(SITE),
    });
    assert.deepEqual(result, { answered_by: BACKEND });
    assert.deepEqual(gateway.sent.map((s) => s.origin), [SITE_ORIGIN, BACKEND]);
    assert.equal(authorizationOf(gateway.sent[0]), 'token key-one:secret-one');
    assert.equal(
      authorizationOf(gateway.sent[1]),
      'token key-one:secret-one',
      'the backend origin is the session\'s own tenant',
    );
  });

  it('makes one attempt when no pair is known for the site', async () => {
    const gateway = fakeGateway({ [SITE_ORIGIN]: ['network'], [BACKEND]: [200] });
    globalThis.fetch = gateway.fetch;
    assert.equal(
      await platformCall('api.lms.get_courses', undefined, { session: signedIn(SITE) }),
      null,
    );
    assert.deepEqual(gateway.sent.map((s) => s.origin), [SITE_ORIGIN]);
  });

  it('sends credentials to the backend origin when it is the resolved target, never to a third origin', async () => {
    await learnPair();
    const gateway = fakeGateway({ [BACKEND]: [200], [OTHER_ORIGIN]: [200] });
    globalThis.fetch = gateway.fetch;
    // The session's own tenant, reached on its backend origin (the request
    // host resolved it; the session names the site): credentials apply.
    await platformCall('api.lms.get_courses', undefined, {
      session: { user: { apiKey: 'key-one', apiSecret: 'secret-one' } },
      request: requestOn(SHELL_HOST),
    });
    assert.equal(gateway.sent[0].origin, BACKEND);
    assert.equal(authorizationOf(gateway.sent[0]), 'token key-one:secret-one');
    // Another tenant's session, on this tenant's backend origin: none.
    await platformCall('api.lms.get_courses', undefined, {
      session: signedIn('tenant-two.platform-shell.co'),
      baseUrl: BACKEND,
    });
    assert.equal(gateway.sent[1].origin, BACKEND);
    assert.equal(authorizationOf(gateway.sent[1]), undefined);
    // The session's tenant, steered at a third origin: none either.
    await platformCall('api.lms.get_courses', undefined, {
      session: signedIn(SITE),
      baseUrl: OTHER_ORIGIN,
    });
    assert.equal(gateway.sent[2].origin, OTHER_ORIGIN);
    assert.equal(authorizationOf(gateway.sent[2]), undefined);
  });

  it('resolves another tenant\'s session to ITS site: one attempt there, no pair, no credentials elsewhere', async () => {
    await learnPair();
    const gateway = fakeGateway({ [OTHER_ORIGIN]: ['network'], [BACKEND]: [200], [SITE_ORIGIN]: [200] });
    globalThis.fetch = gateway.fetch;
    const result = await platformCall('api.lms.get_courses', undefined, {
      session: signedIn('tenant-two.platform-shell.co'),
      request: requestOn(SHELL_HOST),
    });
    assert.equal(result, null);
    assert.deepEqual(gateway.sent.map((s) => s.origin), [OTHER_ORIGIN], 'the session\'s site wins the resolution');
    assert.equal(authorizationOf(gateway.sent[0]), 'token key-one:secret-one');
  });
});

describe('an explicit baseUrl', () => {
  it('is never retried on the other origin, even when the pair is known', async () => {
    await learnPair();
    const gateway = fakeGateway({ [BACKEND]: ['network'], [SITE_ORIGIN]: [200] });
    globalThis.fetch = gateway.fetch;
    assert.equal(
      await platformCall('api.lms.get_courses', undefined, {
        baseUrl: BACKEND,
        session: null,
        requireAuth: false,
      }),
      null,
    );
    assert.deepEqual(gateway.sent.map((s) => s.origin), [BACKEND]);
  });
});
