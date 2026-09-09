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
// auth_sdk 1.7.0: the post-register local link. Run by tests/test_manifest.py
// against staged copies of app/(auth)/register-link.ts (with tenant-link.ts
// and register-provision.ts for their types) under node's own test runner.
// Every name and site here is invented.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  linkRegisteredAccount,
  onboardingDataFor,
  registrationSite,
  type RegisteredAccount,
  type RegisterSuccess,
  type RegistrationLinker,
} from './register-link.ts';
import type { TenantLinkRegistration } from './tenant-link.ts';

const account = (over: Partial<RegisteredAccount> = {}): RegisteredAccount => ({
  email: 'nomsa@fynbos-books.example',
  firstName: 'Nomsa',
  lastName: 'Dlamini',
  values: {},
  tenantSite: null,
  ...over,
});

/** A link that records what it was asked to write. */
const recording = () => {
  const writes: Array<{ email: string; registration: TenantLinkRegistration }> = [];
  let loads = 0;
  const load = async (): Promise<RegistrationLinker> => {
    loads += 1;
    return {
      async linkRegistration(email, registration) {
        writes.push({ email, registration });
      },
    };
  };
  return { writes, load, loads: () => loads };
};

describe('after any provisioner succeeds, auth links the account locally', () => {
  it('writes the row for the email, against the site the outcome names', async () => {
    const link = recording();
    const outcome: RegisterSuccess = { status: 'success', siteName: 'fynbos.rokct.example' };
    await linkRegisteredAccount(account({ tenantSite: 'portal.fynbos.example' }), outcome, link.load);
    assert.equal(link.loads(), 1);
    assert.equal(link.writes.length, 1);
    assert.equal(link.writes[0].email, 'nomsa@fynbos-books.example');
    assert.equal(link.writes[0].registration.siteName, 'fynbos.rokct.example');
  });

  it('falls back to the tenant site the request came from, then to null', () => {
    const outcome: RegisterSuccess = { status: 'success' };
    assert.equal(registrationSite(account({ tenantSite: 'portal.fynbos.example' }), outcome), 'portal.fynbos.example');
    assert.equal(registrationSite(account(), outcome), null);
    assert.equal(registrationSite(account(), { status: 'success', siteName: null }), null);
  });

  it('stores the 1.6.0 onboarding record, from the home SDK values when declared', () => {
    const declared = onboardingDataFor(
      account({ values: { company_name: 'Fynbos Books', country: 'South Africa', industry: 'Retail', plan: 'Starter' } }),
    );
    assert.deepEqual(declared, {
      user_fullname: 'Nomsa Dlamini',
      company_name: 'Fynbos Books',
      location: 'South Africa',
      industry: 'Retail',
      full_name: 'Nomsa Dlamini',
      trading_name: 'Fynbos Books',
      primary_base: 'South Africa',
    });
    const bare = onboardingDataFor(account({ values: { company_name: '  ' } }));
    assert.equal(bare.full_name, 'Nomsa Dlamini');
    assert.equal(bare.company_name, null);
    assert.equal(bare.location, null);
    assert.equal(bare.industry, null);
  });

  it('never hands the password to the link, and lets the link decide what to write', async () => {
    const link = recording();
    await linkRegisteredAccount(account(), { status: 'success', signIn: false, message: 'Check your mail' }, link.load);
    assert.deepEqual(Object.keys(link.writes[0].registration).sort(), ['onboardingData', 'siteName']);
    assert.ok(!JSON.stringify(link.writes[0]).includes('password'));
    // A no-op link (the single-tenant built-in) is a valid answer.
    await assert.doesNotReject(
      linkRegisteredAccount(account(), { status: 'success' }, async () => ({ async linkRegistration() {} })),
    );
  });

  it('reports the link\'s failure to the caller, as 1.6.0 did', async () => {
    await assert.rejects(
      linkRegisteredAccount(account(), { status: 'success' }, async () => ({
        async linkRegistration() {
          throw new Error('no database configured');
        },
      })),
      /no database configured/,
    );
  });
});
