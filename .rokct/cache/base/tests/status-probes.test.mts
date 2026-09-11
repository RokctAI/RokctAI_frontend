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

// base_sdk 1.37.0: the footer status probes the tenant only by default
// (Ray, 2026-09-09: every shell reads its footer status from its own
// tenant backend, never from control); control is opt-in through
// ROKCT_STATUS_SOURCE. Run by tests/test_manifest.py against a staged
// copy of components/custom/landing/footer-chrome-config.ts under node's
// own test runner with type stripping.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_PLATFORM_STATUS_SOURCES,
  PLATFORM_STATUS_PROBES,
  PLATFORM_VERSION_CMD,
  isProbeAnswer,
  readPlatformVersion,
  resolvePlatformStatusProbes,
} from './footer-chrome-config.ts';

const sites = (source?: string | null) =>
  resolvePlatformStatusProbes(source).map((p) => p.site);

describe('resolvePlatformStatusProbes: the default', () => {
  it('is the tenant only - no control probe - when ROKCT_STATUS_SOURCE is unset or blank', () => {
    assert.deepEqual([...DEFAULT_PLATFORM_STATUS_SOURCES], ['tenant']);
    for (const source of [undefined, null, '', '   ']) {
      const probes = resolvePlatformStatusProbes(source);
      assert.deepEqual(probes.map((p) => p.site), ['tenant'], String(source));
      assert.equal(probes[0].cmd, 'api.system.api_status');
      assert.ok(!probes.some((p) => p.site === 'control'), 'control must not be probed by default');
    }
  });

  it('is the tenant only when nothing named is recognised', () => {
    assert.deepEqual(sites('nowhere'), ['tenant']);
    assert.deepEqual(sites('nowhere, elsewhere'), ['tenant']);
  });

  it('the catalogue still carries both probes, so the opt-in has something to name', () => {
    assert.deepEqual(
      PLATFORM_STATUS_PROBES.map((p) => [p.site, p.cmd]),
      [
        ['tenant', 'api.system.api_status'],
        ['control', 'control:get_versions'],
      ],
    );
  });
});

describe('resolvePlatformStatusProbes: the opt-in', () => {
  it('control alone pins a control-plane shell to control', () => {
    const probes = resolvePlatformStatusProbes('control');
    assert.deepEqual(probes.map((p) => p.site), ['control']);
    assert.equal(probes[0].cmd, 'control:get_versions');
  });

  it('tenant,control keeps control as the fallback, in the order named, once each', () => {
    assert.deepEqual(sites('tenant,control'), ['tenant', 'control']);
    assert.deepEqual(sites('control, tenant'), ['control', 'tenant']);
    assert.deepEqual(sites('tenant,tenant,control,control'), ['tenant', 'control']);
    assert.deepEqual(sites('CONTROL'), ['control']);
    assert.deepEqual(sites('tenant, nowhere, control'), ['tenant', 'control']);
  });

  it('off and none run nothing, so the row hides the indicator', () => {
    assert.deepEqual(sites('off'), []);
    assert.deepEqual(sites('none'), []);
    assert.deepEqual(sites(' OFF '), []);
  });

  it('never hands out the catalogue itself', () => {
    const probes = resolvePlatformStatusProbes('tenant,control');
    assert.notEqual(probes, PLATFORM_STATUS_PROBES);
    probes.pop();
    assert.equal(PLATFORM_STATUS_PROBES.length, 2);
  });
});

describe('isProbeAnswer: what counts as an answer (1.40.0)', () => {
  it('is a plain object with something in it', () => {
    assert.equal(isProbeAnswer({ status: 'ok' }), true);
    assert.equal(isProbeAnswer({ data: { status: 'ok', version: '1.0.0' } }), true);
    assert.equal(isProbeAnswer({ control: '1.0.0' }), true);
  });

  it('is not null, undefined, a scalar, an array or an empty object', () => {
    for (const nothing of [null, undefined, '', 'ok', 0, true, [], [{ status: 'ok' }], {}]) {
      assert.equal(isProbeAnswer(nothing), false, JSON.stringify(nothing) ?? String(nothing));
    }
  });

  it('looks through the gateway envelope: {message: null} is empty, {message: {status}} is an answer', () => {
    for (const nothing of [{ message: null }, { message: undefined }, { message: {} }, { message: 'ok' }, { message: [] }]) {
      assert.equal(isProbeAnswer(nothing), false, JSON.stringify(nothing));
    }
    assert.equal(isProbeAnswer({ message: { status: 'ok' } }), true);
    assert.equal(isProbeAnswer({ message: { data: { status: 'ok' } } }), true);
    // Any second field beside message is content of its own.
    assert.equal(isProbeAnswer({ message: null, status: 'ok' }), true);
  });
});

describe('readPlatformVersion: the version cmd and its answer (1.40.0)', () => {
  it('asks the ONE registered tenant cmd that carries the version - the tenant status probe', () => {
    assert.equal(PLATFORM_VERSION_CMD, 'api.system.api_status');
    assert.equal(PLATFORM_STATUS_PROBES.find((p) => p.site === 'tenant')?.cmd, PLATFORM_VERSION_CMD);
    assert.notEqual(PLATFORM_VERSION_CMD, 'api.get_version');
  });

  it('reads the envelope, the gateway wrapper around it, or a bare version', () => {
    assert.equal(readPlatformVersion({ data: { status: 'ok', version: '15.2.0', user: 'Guest' } }), '15.2.0');
    assert.equal(readPlatformVersion({ message: { data: { version: '15.2.0' } } }), '15.2.0');
    assert.equal(readPlatformVersion({ message: { version: '15.2.0' } }), '15.2.0');
    assert.equal(readPlatformVersion({ version: '15.2.0' }), '15.2.0');
  });

  it('is null unless the field is a string', () => {
    for (const nothing of [null, undefined, '', '15.2.0', 0, [], {}, { version: 15 }, { version: null }, { data: {} }, { data: { version: ['15'] } }, { message: 'ok' }, { message: null, version: 1 }]) {
      assert.equal(readPlatformVersion(nothing), null, JSON.stringify(nothing) ?? String(nothing));
    }
  });
});
