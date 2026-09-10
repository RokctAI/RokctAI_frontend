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
// agent_sdk 1.12.0: rokct.ai's register provisioner. Run by
// tests/test_manifest.py against staged copies of
// app/(auth)/agent-register-provision.ts and
// app/(auth)/agent-register-helpers.ts, with auth_sdk's tenant link and
// base_sdk's gateway replaced by tests/stubs, under node's own test runner.

import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import provisioner from './agent-register-provision.ts';
import {
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  PRICING_METADATA_PATH,
  PROVISIONING_TIMEOUT_MS,
  isAiPlan,
  isServicePlan,
} from './agent-register-helpers.ts';
import { admin } from './stubs/app/(auth)/tenant-link.ts';
import {
  PlatformGatewayError,
  gateway,
} from './stubs/app/services/base/platform-gateway.ts';
import { catalogue } from './stubs/lib/actions/getSubscriptionPlans.ts';

const CONTROL = 'https://control.rokct.invalid';
const ADMIN = { apiKey: 'test-key', apiSecret: 'test-secret' };

const submission = (values: Record<string, string>) => ({
  email: 'owner@rokct.invalid',
  password: 'pw-for-test',
  firstName: 'First',
  lastName: 'Last',
  values: {
    plan: 'Team',
    industry: 'Retail',
    company_name: 'A Company',
    country: 'Kenya',
    ...values,
  },
  tenantSite: null,
});

const plans = (...rows: Record<string, unknown>[]) => {
  catalogue.answer = { success: true, data: rows };
};

/** A pricing-metadata answer, or a failed read. */
function pricing(answer: { currency?: string; country_name?: string } | null) {
  const urls: string[] = [];
  globalThis.fetch = (async (input: string | URL) => {
    urls.push(String(input));
    if (!answer) throw new Error('offline');
    return {
      ok: true,
      json: async () => ({ message: answer }),
    } as unknown as Response;
  }) as typeof fetch;
  return urls;
}

const silenced = async <T>(fn: () => Promise<T>): Promise<T> => {
  const error = console.error;
  const warn = console.warn;
  console.error = () => {};
  console.warn = () => {};
  try {
    return await fn();
  } finally {
    console.error = error;
    console.warn = warn;
  }
};

const realFetch = globalThis.fetch;

describe('the provisioner', () => {
  beforeEach(() => {
    process.env.ROKCT_BASE_URL = CONTROL;
    admin.answer = ADMIN;
    gateway.reset();
    gateway.answer = () => ({ site_name: 'a-company.rokct.invalid' });
    plans({ plan_name: 'Team', plan_type: 'Tenant', is_ai: 1 });
    pricing({ currency: 'KES', country_name: 'Kenya' });
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('is the module\'s default export', () => {
    assert.equal(typeof provisioner.provision, 'function');
  });

  it('stops without an administrator, calling nothing', async () => {
    admin.answer = null;
    const outcome = await provisioner.provision(submission({}));
    assert.deepEqual(outcome, {
      status: 'failed',
      error: 'System not initialized. Administrator must login first.',
    });
    assert.deepEqual(gateway.calls, []);
  });

  it('stops without ROKCT_BASE_URL', async () => {
    delete process.env.ROKCT_BASE_URL;
    const outcome = await silenced(() => provisioner.provision(submission({})));
    assert.deepEqual(outcome, { status: 'failed', error: 'Could not create user.' });
    assert.deepEqual(gateway.calls, []);
  });

  it('resolves country and currency at the control site\'s get_pricing_metadata', async () => {
    const urls = pricing({ currency: 'KES', country_name: 'Kenya' });
    await provisioner.provision(submission({ country: 'kenya' }));
    assert.equal(urls.length, 1);
    assert.equal(urls[0], `${CONTROL}${PRICING_METADATA_PATH}?country=kenya`);
    const payload = gateway.calls[0].payload as Record<string, unknown>;
    assert.equal(payload.currency, 'KES');
    assert.equal(payload.country, 'Kenya');
  });

  it('keeps the input country and the default currency when that read fails', async () => {
    pricing(null);
    await silenced(() => provisioner.provision(submission({ country: 'Kenya' })));
    const payload = gateway.calls[0].payload as Record<string, unknown>;
    assert.equal(payload.currency, DEFAULT_CURRENCY);
    assert.equal(DEFAULT_CURRENCY, 'USD');
    assert.equal(payload.country, 'Kenya');
  });

  it('falls back to South Africa when the form named no country', async () => {
    const urls = pricing(null);
    await silenced(() => provisioner.provision(submission({ country: '' })));
    assert.equal(DEFAULT_COUNTRY, 'South Africa');
    assert.equal(urls[0], `${CONTROL}${PRICING_METADATA_PATH}?country=South%20Africa`);
    assert.equal((gateway.calls[0].payload as Record<string, unknown>).country, 'South Africa');
  });

  it('provisions a tenant plan at control:provision_new_tenant under the administrator', async () => {
    const outcome = await provisioner.provision(
      submission({ voucher_code: 'V1', domain: 'ignored.rokct.invalid' }),
    );
    assert.equal(gateway.calls.length, 1);
    const [call] = gateway.calls;
    assert.equal(call.cmd, 'control:provision_new_tenant');
    assert.deepEqual(call.payload, {
      email: 'owner@rokct.invalid',
      company_name: 'A Company',
      plan: 'Team',
      first_name: 'First',
      last_name: 'Last',
      currency: 'KES',
      country: 'Kenya',
      industry: 'Retail',
      voucher_code: 'V1',
    });
    assert.deepEqual(call.options, {
      baseUrl: CONTROL,
      headers: { Authorization: `token ${ADMIN.apiKey}:${ADMIN.apiSecret}` },
      throwOnError: true,
      timeout: PROVISIONING_TIMEOUT_MS,
    });
    assert.equal(PROVISIONING_TIMEOUT_MS, 60000);
    assert.equal(outcome.status, 'success');
    if (outcome.status !== 'success') return;
    assert.equal(outcome.siteName, 'a-company.rokct.invalid');
  });

  it('signs a tenant AI plan in as an onboarding login', async () => {
    const outcome = await provisioner.provision(submission({}));
    assert.equal(outcome.status, 'success');
    if (outcome.status !== 'success') return;
    assert.deepEqual(outcome.signIn, {
      email: 'owner@rokct.invalid',
      password: 'pw-for-test',
      extra: { is_onboarding: 'true' },
    });
  });

  it('leaves a tenant non-AI plan signed out until the site is ready', async () => {
    plans({ plan_name: 'Team', plan_type: 'Tenant', is_ai: 0 });
    const outcome = await provisioner.provision(submission({}));
    assert.equal(outcome.status, 'success');
    if (outcome.status !== 'success') return;
    assert.equal(outcome.signIn, false);
    assert.equal(outcome.siteName, 'a-company.rokct.invalid');
  });

  it('provisions a Service plan at control:provision_service_subscription with the domain and signs in', async () => {
    plans({ plan_name: 'Hosted', plan_type: 'Service', is_ai: 0 });
    const outcome = await provisioner.provision(
      submission({ plan: 'Hosted', domain: 'shop.rokct.invalid' }),
    );
    const [call] = gateway.calls;
    assert.equal(call.cmd, 'control:provision_service_subscription');
    assert.deepEqual(call.payload, {
      plan: 'Hosted',
      email: 'owner@rokct.invalid',
      password: 'pw-for-test',
      first_name: 'First',
      last_name: 'Last',
      company_name: 'A Company',
      currency: 'KES',
      country: 'Kenya',
      industry: 'Retail',
      voucher_code: null,
      domain: 'shop.rokct.invalid',
      lines: 1,
    });
    assert.equal(outcome.status, 'success');
    if (outcome.status !== 'success') return;
    assert.deepEqual(outcome.signIn, { email: 'owner@rokct.invalid', password: 'pw-for-test' });
  });

  it('never names a site on the sign-in, as the old login parameters named none', async () => {
    const outcome = await provisioner.provision(submission({}));
    assert.equal(outcome.status, 'success');
    if (outcome.status !== 'success' || !outcome.signIn) return;
    assert.equal('siteName' in outcome.signIn, false);
  });

  it('provisions nothing without a company name', async () => {
    plans({ plan_name: 'Team', plan_type: 'Tenant', is_ai: 1 });
    const outcome = await provisioner.provision(submission({ company_name: '' }));
    assert.deepEqual(gateway.calls, []);
    assert.equal(outcome.status, 'success');
    if (outcome.status !== 'success') return;
    assert.equal(outcome.siteName, null);
  });

  it('reports a non-2xx answer as the provisioning failure', async () => {
    gateway.answer = () => {
      throw new PlatformGatewayError('http_error', 500);
    };
    assert.deepEqual(await provisioner.provision(submission({})), {
      status: 'failed',
      error: 'Tenant Provisioning failed',
    });
    plans({ plan_name: 'Hosted', plan_type: 'Service' });
    assert.deepEqual(await provisioner.provision(submission({ plan: 'Hosted' })), {
      status: 'failed',
      error: 'Service Provisioning failed',
    });
  });

  it('reports any other provisioning error as an exception', async () => {
    gateway.answer = () => {
      throw new PlatformGatewayError('timeout');
    };
    const outcome = await silenced(() => provisioner.provision(submission({})));
    assert.deepEqual(outcome, {
      status: 'failed',
      error: 'Provisioning exception occurred.',
    });
  });

  it('takes a bare string answer as the site name', async () => {
    gateway.answer = () => 'bare.rokct.invalid';
    const outcome = await provisioner.provision(submission({}));
    assert.equal(outcome.status, 'success');
    if (outcome.status !== 'success') return;
    assert.equal(outcome.siteName, 'bare.rokct.invalid');
  });
});

describe('the plan rules', () => {
  it('a Service plan is one the catalogue calls Service, or a name involving hosting', () => {
    assert.equal(isServicePlan('Hosted', { plan_name: 'Hosted', plan_type: 'Service' }), true);
    assert.equal(isServicePlan('Team', { plan_name: 'Team', plan_type: 'Tenant' }), false);
    assert.equal(isServicePlan('Web Hosting Basic', null), true);
    assert.equal(isServicePlan('Team', null), false);
    // A flag a form still sends is honoured.
    assert.equal(isServicePlan('Team', null, 'on'), true);
    assert.equal(isServicePlan('Team', null, 'true'), true);
    assert.equal(isServicePlan('Team', null, ''), false);
  });

  it('an AI plan is one whose is_ai is 1', () => {
    assert.equal(isAiPlan({ plan_name: 'Team', is_ai: 1 }), true);
    assert.equal(isAiPlan({ plan_name: 'Team', is_ai: 0 }), false);
    assert.equal(isAiPlan({ plan_name: 'Team' }), false);
    assert.equal(isAiPlan(null), false);
  });
});
