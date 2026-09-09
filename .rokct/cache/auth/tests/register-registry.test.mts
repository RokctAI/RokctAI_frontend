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
// auth_sdk 1.7.0: the register registry. Run by tests/test_manifest.py
// against staged copies of components/custom/auth/register-registry.ts and
// app/(auth)/register-provision.ts under node's own test runner.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_REGISTER_CONFIG,
  loadRegisterConfig,
  registerOffered,
  resolveRegisterConfig,
  serialisableFields,
  type RegisterConfig,
  type RegisterEntry,
} from './register-registry.ts';
import {
  loadRegisterProvisioner,
  type RegisterOutcome,
  type RegisterProvisionEntry,
  type RegisterProvisioner,
  type RegisterSubmission,
} from './register-provision.ts';

const entry = (id: string, config: RegisterConfig | null): RegisterEntry => ({
  id,
  load: async () => ({ default: config }),
});

const silenced = async <T>(fn: () => Promise<T>): Promise<T> => {
  const original = console.error;
  console.error = () => {};
  try {
    return await fn();
  } finally {
    console.error = original;
  }
};

describe('nothing injected: auth_sdk\'s own register page', () => {
  it('is offered, with the account fields only and the platform\'s words', async () => {
    const config = await loadRegisterConfig([]);
    assert.equal(config.enabled, true);
    assert.deepEqual(config.fields, []);
    assert.deepEqual(config.steps, []);
    assert.deepEqual(config.copy, DEFAULT_REGISTER_CONFIG.copy);
    assert.equal(registerOffered(null), true);
    assert.equal(registerOffered(undefined), true);
    assert.equal(registerOffered({}), true);
  });

  it('a registered null is the default too', async () => {
    const config = await loadRegisterConfig([entry('a-register', null)]);
    assert.deepEqual(config, resolveRegisterConfig(null));
  });
});

describe('an injected config', () => {
  const injected: RegisterConfig = {
    copy: { title: 'Open your workspace', cta: 'Start' },
    fields: [
      { name: 'workspace_name', label: 'Workspace', required: true, span: 2 },
      {
        name: 'plan',
        label: 'Plan',
        type: 'select',
        fromQuery: 'plan',
        loadOptions: async () => [{ value: 'starter', label: 'Starter' }],
      },
    ],
    steps: [
      { id: 'team', label: 'Your team', load: async () => ({ default: () => null }) },
    ],
  };

  it('replaces the fields and steps, and lays its copy over the default', async () => {
    const config = await loadRegisterConfig([entry('home-register', injected)]);
    assert.equal(config.enabled, true);
    assert.deepEqual(config.fields.map((f) => f.name), ['workspace_name', 'plan']);
    assert.deepEqual(config.steps.map((s) => s.id), ['team']);
    assert.equal(config.copy.title, 'Open your workspace');
    assert.equal(config.copy.cta, 'Start');
    assert.equal(config.copy.subtitle, DEFAULT_REGISTER_CONFIG.copy.subtitle, 'a word not given keeps the default');
    assert.equal(config.copy.signInLabel, DEFAULT_REGISTER_CONFIG.copy.signInLabel);
  });

  it('is single-answer: the first entry that loads wins', async () => {
    const config = await loadRegisterConfig([
      entry('home-register', injected),
      entry('other-register', { copy: { title: 'Other' } }),
    ]);
    assert.equal(config.copy.title, 'Open your workspace');
  });

  it('an entry that fails to load is skipped for the next', async () => {
    const broken: RegisterEntry = { id: 'broken-register', load: async () => { throw new Error('no module'); } };
    const config = await silenced(() => loadRegisterConfig([broken, entry('home-register', injected)]));
    assert.equal(config.copy.title, 'Open your workspace');
    const fallback = await silenced(() => loadRegisterConfig([broken]));
    assert.deepEqual(fallback, resolveRegisterConfig(null));
  });

  it('serialisableFields drops the option loaders and nothing else', () => {
    const fields = serialisableFields(injected.fields!);
    assert.equal('loadOptions' in fields[1], false);
    assert.equal(fields[1].fromQuery, 'plan');
    assert.equal(fields[0].span, 2);
    assert.equal(typeof injected.fields![1].loadOptions, 'function', 'the original is untouched');
  });
});

describe('register switched off by config', () => {
  it('is not offered, whatever else the config says', async () => {
    const config = await loadRegisterConfig([entry('home-register', { enabled: false, copy: { title: 'X' } })]);
    assert.equal(config.enabled, false);
    assert.equal(registerOffered(config), false);
    assert.equal(registerOffered({ enabled: false }), false);
  });
});

describe('the provisioner registry', () => {
  const submission: RegisterSubmission = {
    email: 'owner@tenant-one.co',
    password: 'pw',
    firstName: 'A',
    lastName: 'B',
    values: { workspace_name: 'Alpha' },
    tenantSite: 'tenant-one.platform-shell.co',
  };
  const provisioner = (tag: string): RegisterProvisioner => ({
    provision: async (s): Promise<RegisterOutcome> => ({ status: 'success', siteName: s.tenantSite, message: tag }),
  });
  const provisionEntry = (id: string, p: RegisterProvisioner): RegisterProvisionEntry => ({
    id,
    load: async () => ({ default: p }),
  });
  const fallback = async () => ({ default: provisioner('default') });

  it('answers the fallback (auth_sdk\'s generic account) with nothing registered', async () => {
    const chosen = await loadRegisterProvisioner([], fallback);
    const outcome = await chosen.provision(submission);
    assert.deepEqual(outcome, { status: 'success', siteName: 'tenant-one.platform-shell.co', message: 'default' });
  });

  it('an injected provisioner replaces the default and sees every extra value', async () => {
    let seen: RegisterSubmission | undefined;
    const injected: RegisterProvisioner = {
      provision: async (s) => {
        seen = s;
        return { status: 'user_exists' };
      },
    };
    const chosen = await loadRegisterProvisioner([provisionEntry('home-register-provision', injected)], fallback);
    assert.deepEqual(await chosen.provision(submission), { status: 'user_exists' });
    assert.deepEqual(seen?.values, { workspace_name: 'Alpha' });
    assert.equal(seen?.tenantSite, 'tenant-one.platform-shell.co');
  });

  it('a broken entry falls through to the next, then the default', async () => {
    const broken: RegisterProvisionEntry = { id: 'broken', load: async () => { throw new Error('no module'); } };
    const chosen = await silenced(() => loadRegisterProvisioner([broken], fallback));
    assert.equal((await chosen.provision(submission) as { message?: string }).message, 'default');
  });
});
