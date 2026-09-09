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
// The host shell's middleware, installed by auth_sdk (NextAuth-gated).
// auth_sdk 1.7.0: the tenant-host switch's pure decision. Run by
// tests/test_manifest.py against a staged copy of app/(auth)/tenant-host.ts
// under node's own test runner (22.6+, type stripping). Every host name
// here is invented.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  TENANT_HOME_PATHS,
  TENANT_LOGIN_PATH,
  TENANT_REGISTER_PATHS,
  isPassThrough,
  normalisePathname,
  resolveTenantSite,
  tenantHostDecision,
} from './tenant-host.ts';

describe('tenantHostDecision on a resolved tenant host', () => {
  it('rewrites the root and the landing page to the login', () => {
    for (const path of ['/', '/landing', '/landing/']) {
      assert.deepEqual(tenantHostDecision(path), { kind: 'rewrite', to: TENANT_LOGIN_PATH }, path);
    }
    assert.deepEqual([...TENANT_HOME_PATHS], ['/', '/landing']);
  });

  it('redirects every sign-up route to the login', () => {
    for (const path of ['/register', '/register/', '/register/plan']) {
      assert.deepEqual(tenantHostDecision(path), { kind: 'redirect', to: TENANT_LOGIN_PATH }, path);
    }
    assert.deepEqual([...TENANT_REGISTER_PATHS], ['/register']);
    assert.equal(TENANT_LOGIN_PATH, '/login');
  });

  it('leaves every other path to the existing path/role logic', () => {
    for (const path of [
      '/login',
      '/login/',
      '/forgot-password',
      '/handson/x',
      '/api/auth/session',
      '/paas/admin',
      '/registered',
      '/landing-page',
    ]) {
      assert.deepEqual(tenantHostDecision(path), { kind: 'next' }, path);
    }
  });

  it('normalises a trailing slash but keeps the root', () => {
    assert.equal(normalisePathname('/'), '/');
    assert.equal(normalisePathname('///'), '/');
    assert.equal(normalisePathname('/landing/'), '/landing');
    assert.equal(normalisePathname('/a/b'), '/a/b');
  });
});

describe('isPassThrough (which of the gate\'s answers the switch may reshape)', () => {
  const answer = (status: number, headers: Record<string, string>) => ({
    status,
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
  });
  it('is true for a plain next()', () => {
    assert.equal(isPassThrough(answer(200, { 'x-middleware-next': '1' })), true);
  });
  it('is false for a redirect, a rewrite, or an error', () => {
    assert.equal(isPassThrough(answer(307, { location: '/login' })), false);
    assert.equal(isPassThrough(answer(200, { 'x-middleware-next': '1', 'x-middleware-rewrite': '/x' })), false);
    assert.equal(isPassThrough(answer(200, {})), false);
    assert.equal(isPassThrough(answer(401, { 'x-middleware-next': '1' })), false);
  });
});

describe('resolveTenantSite (the login page and the login action)', () => {
  it('lets the site_name query parameter win over the forwarded header', () => {
    assert.equal(resolveTenantSite('tenant-one.platform-shell.co', 'tenant-two.platform-shell.co'), 'tenant-one.platform-shell.co');
    assert.equal(resolveTenantSite(['tenant-one.platform-shell.co', 'x'], null), 'tenant-one.platform-shell.co');
  });
  it('falls back to the header when the query names nothing', () => {
    assert.equal(resolveTenantSite(undefined, 'tenant-two.platform-shell.co'), 'tenant-two.platform-shell.co');
    assert.equal(resolveTenantSite('  ', ' tenant-two.platform-shell.co '), 'tenant-two.platform-shell.co');
    assert.equal(resolveTenantSite([], 'tenant-two.platform-shell.co'), 'tenant-two.platform-shell.co');
  });
  it('is null - the storefront - with neither', () => {
    assert.equal(resolveTenantSite(undefined, null), null);
    assert.equal(resolveTenantSite('', ''), null);
  });
});
