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

// base_sdk 1.40.0: getPlatformStatus (app/actions/base/status.ts) executed
// against a stub gateway - a 2xx whose body is null, a scalar or {} is not
// an answer and reads as offline; a real answer reads as operational or
// maintenance; the first real answer decides. Run by tests/test_manifest.py
// against a staged copy of status.ts beside the real
// footer-chrome-config.ts and a stub platform-gateway.ts whose
// platformCall answers what `answers` holds (a function throws), under
// node's own test runner with type stripping.

import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { PlatformGatewayError, answers, calls } from './platform-gateway.ts';
import { getPlatformStatus } from './status.ts';

describe('getPlatformStatus: an empty 2xx is not an answer (1.40.0)', () => {
  beforeEach(() => {
    answers.length = 0;
    calls.length = 0;
    delete process.env.ROKCT_STATUS_SOURCE;
    delete process.env.ROKCT_CONTROL_BASE_URL;
    delete process.env.NEXT_PUBLIC_ROKCT_CONTROL_BASE_URL;
    delete process.env.ROKCT_BASE_URL;
    delete process.env.NEXT_PUBLIC_ROKCT_BASE_URL;
  });
  afterEach(() => {
    answers.length = 0;
  });

  it('(a) a 2xx whose body is JSON null - platformCall returns null and throws nothing - is offline, never operational', async () => {
    answers.push(null);
    const status = await getPlatformStatus();
    assert.deepEqual(status, { state: 'offline', site: null });
    assert.notEqual(status.state, 'operational');
    assert.notEqual(status.state, 'unconfigured');
    assert.equal(calls.length, 1);
  });

  it('a 2xx whose body is undefined is offline too', async () => {
    answers.push(undefined);
    assert.deepEqual(await getPlatformStatus(), { state: 'offline', site: null });
  });

  it('(b) a genuinely empty 2xx body: res.json() rejects, platformCall throws - offline, never operational or unconfigured', async () => {
    // platformCall wraps the parse failure as a network_error gateway
    // error when throwOnError is set, which getPlatformStatus does.
    answers.push(() => {
      throw new PlatformGatewayError('api.system.api_status', 'network_error', undefined);
    });
    const status = await getPlatformStatus();
    assert.deepEqual(status, { state: 'offline', site: null });
    assert.notEqual(status.state, 'operational');
    assert.notEqual(status.state, 'unconfigured');
  });

  it('(c) a 2xx body of {"message": null}: platformCall hands back the envelope itself - offline, never operational or unconfigured', async () => {
    // `data?.message || data` with a null message is the truthy `{message: null}`.
    answers.push({ message: null });
    const status = await getPlatformStatus();
    assert.deepEqual(status, { state: 'offline', site: null });
    assert.notEqual(status.state, 'operational');
    assert.notEqual(status.state, 'unconfigured');
    assert.equal(calls.length, 1);
  });

  it('{}: offline', async () => {
    answers.push({});
    assert.deepEqual(await getPlatformStatus(), { state: 'offline', site: null });
  });

  it('a scalar or an array: offline', async () => {
    for (const nothing of ['ok', 0, true, [], [{ status: 'ok' }]]) {
      answers.length = 0;
      answers.push(nothing);
      assert.equal((await getPlatformStatus()).state, 'offline', JSON.stringify(nothing));
    }
  });

  it('{status:"ok"}: operational, from the tenant', async () => {
    answers.push({ status: 'ok' });
    assert.deepEqual(await getPlatformStatus(), { state: 'operational', site: 'tenant', version: null });
  });

  it('the base_sdk envelope: maintenance and the version read as before', async () => {
    answers.push({ data: { status: 'maintenance', version: '2.1.0', user: 'Guest' } });
    assert.deepEqual(await getPlatformStatus(), { state: 'maintenance', site: 'tenant', version: '2.1.0' });
  });

  it('an empty tenant answer falls through to an opted-in control probe that answers', async () => {
    process.env.ROKCT_STATUS_SOURCE = 'tenant,control';
    process.env.ROKCT_CONTROL_BASE_URL = 'https://control.example';
    answers.push({}, { control: '3.0.0' });
    assert.deepEqual(await getPlatformStatus(), { state: 'operational', site: 'control', version: null });
    assert.deepEqual(calls.map((c) => c.site), ['tenant', 'control']);
  });

  it('a probe with no origin is not attempted: unconfigured, as before', async () => {
    answers.push(() => {
      throw new PlatformGatewayError('api.system.api_status', 'no_base_url');
    });
    assert.deepEqual(await getPlatformStatus(), { state: 'unconfigured', site: null });
  });

  it('a probe that fails is offline, as before', async () => {
    answers.push(() => {
      throw new PlatformGatewayError('api.system.api_status', 'http_error', 503);
    });
    assert.deepEqual(await getPlatformStatus(), { state: 'offline', site: null });
  });
});

describe('getPlatformStatus: the hidden indicator is the explicit switch only', () => {
  // `unconfigured` is the state the footer hides the indicator on
  // (components/custom/footer-chrome.tsx: showStatus is every other state).
  beforeEach(() => {
    answers.length = 0;
    calls.length = 0;
    delete process.env.ROKCT_STATUS_SOURCE;
    delete process.env.ROKCT_CONTROL_BASE_URL;
    delete process.env.ROKCT_BASE_URL;
  });

  it('ROKCT_STATUS_SOURCE=off and =none: unconfigured, with no probe run', async () => {
    for (const off of ['off', 'none', ' OFF ']) {
      process.env.ROKCT_STATUS_SOURCE = off;
      assert.deepEqual(await getPlatformStatus(), { state: 'unconfigured', site: null }, off);
      assert.equal(calls.length, 0, off);
    }
  });

  it('a failed probe is offline, not unconfigured: a failure never hides the indicator', async () => {
    for (const reason of ['http_error', 'network_error'] as const) {
      answers.length = 0;
      answers.push(() => {
        throw new PlatformGatewayError('api.system.api_status', reason, reason === 'http_error' ? 500 : undefined);
      });
      const status = await getPlatformStatus();
      assert.equal(status.state, 'offline', reason);
      assert.notEqual(status.state, 'unconfigured', reason);
    }
    answers.length = 0;
    answers.push(() => {
      throw new Error('not even a gateway error');
    });
    assert.equal((await getPlatformStatus()).state, 'offline');
  });

  it('an empty probe is offline, not unconfigured: an empty 2xx never hides the indicator', async () => {
    for (const nothing of [null, {}, '', []]) {
      answers.length = 0;
      answers.push(nothing);
      assert.equal((await getPlatformStatus()).state, 'offline', JSON.stringify(nothing));
    }
  });
});
