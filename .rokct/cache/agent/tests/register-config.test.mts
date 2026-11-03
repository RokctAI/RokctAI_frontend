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
// agent_sdk 1.12.0: rokct.ai's register config. Run by
// tests/test_manifest.py against a staged copy of
// components/custom/auth/agent-register-config.ts, with the host modules
// it imports replaced by tests/stubs, under node's own test runner. (The
// header menu's suite moved to hero-copy.test.mts in 1.24.0.)

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import config, {
  DEFAULT_PLAN,
  industryOptions,
  planOptions,
} from './agent-register-config.ts';
import { PLATFORM_NAME } from './stubs/app/config/platform.ts';
import { catalogue } from './stubs/lib/actions/getSubscriptionPlans.ts';
import { industries } from './stubs/app/(auth)/agent-register-actions.ts';

describe('the register config', () => {
  it('registers register as offered', () => {
    assert.equal(config.enabled, true);
  });

  it('carries the copy rokct.ai\'s register page had', () => {
    assert.deepEqual(config.copy, {
      title: 'Create Account',
      subtitle: `Join thousands of companies using ${PLATFORM_NAME}`,
      cta: 'Get Started',
      signInPrompt: 'Already have an account?',
      signInLabel: 'Sign in',
    });
  });

  it('declares the fields the form carried, in its order, under the auth.* keys', () => {
    const fields = config.fields ?? [];
    assert.deepEqual(
      fields.map((f) => f.name),
      ['plan', 'industry', 'company_name', 'country', 'voucher_code', 'domain'],
    );
    const byName = Object.fromEntries(fields.map((f) => [f.name, f]));
    assert.equal(byName.plan.type, 'select');
    assert.equal(byName.plan.fromQuery, 'plan');
    assert.equal(byName.plan.defaultValue, DEFAULT_PLAN);
    assert.equal(DEFAULT_PLAN, 'Free');
    assert.equal(byName.plan.span, 2);
    assert.equal(byName.plan.label, 'auth.selected_plan');
    assert.equal(byName.plan.placeholder, 'auth.ph_select_plan');
    assert.equal(typeof byName.plan.loadOptions, 'function');
    assert.equal(byName.industry.type, 'select');
    assert.equal(byName.industry.required, true);
    assert.equal(byName.industry.label, 'auth.label_industry');
    assert.equal(byName.industry.placeholder, 'auth.ph_select_industry');
    assert.equal(typeof byName.industry.loadOptions, 'function');
    assert.equal(byName.company_name.required, true);
    assert.equal(byName.company_name.label, 'auth.label_company_name');
    assert.equal(byName.company_name.placeholder, 'auth.ph_company_name');
    assert.equal(byName.country.required, true);
    assert.equal(byName.country.label, 'auth.label_country');
    assert.equal(byName.country.placeholder, 'auth.ph_country');
    assert.equal(byName.voucher_code.required, undefined);
    assert.equal(byName.voucher_code.label, 'auth.label_voucher_code');
    assert.equal(byName.voucher_code.placeholder, 'auth.ph_voucher_code');
    assert.equal(byName.domain.required, undefined);
    assert.equal(byName.domain.label, 'auth.label_domain');
    assert.equal(byName.domain.placeholder, 'auth.ph_domain');
    // No account field is redeclared.
    for (const own of ['first_name', 'last_name', 'email', 'password', 'site_name']) {
      assert.equal(byName[own], undefined);
    }
  });

  it('declares no post-account steps', () => {
    assert.deepEqual(config.steps, []);
  });
});

describe('the plan options', () => {
  beforeEach(() => {
    catalogue.answer = { success: false, error: 'not configured' };
  });

  it('list the catalogue by plan name, labelled auth.plan_suffix', async () => {
    catalogue.answer = {
      success: true,
      data: [{ plan_name: 'Free' }, { plan_name: 'Team' }],
    };
    assert.deepEqual(await planOptions(), [
      { value: 'Free', label: 'auth.plan_suffix Free' },
      { value: 'Team', label: 'auth.plan_suffix Team' },
    ]);
  });

  it('are empty when the catalogue read fails', async () => {
    assert.deepEqual(await planOptions(), []);
  });
});

describe('the industry options', () => {
  beforeEach(() => {
    industries.answer = [];
  });

  it('list the control site\'s Industry Type names', async () => {
    industries.answer = ['Agriculture', 'Retail'];
    assert.deepEqual(await industryOptions(), [
      { value: 'Agriculture', label: 'Agriculture' },
      { value: 'Retail', label: 'Retail' },
    ]);
  });

  it('fall back to the form\'s nine defaults when the read answers nothing', async () => {
    const options = await industryOptions();
    assert.deepEqual(
      options.map((o) => o.value),
      ['Manufacturing', 'Retail', 'Technology', 'Healthcare', 'Finance',
       'Education', 'Distribution', 'Services', 'Other'],
    );
    for (const o of options) assert.equal(o.label, o.value);
  });
});
