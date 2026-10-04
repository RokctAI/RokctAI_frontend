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
// auth_sdk 1.9.0: the return path after login or register. Run by
// tests/test_manifest.py against a staged copy of app/(auth)/return-to.ts
// under node's own test runner. Every host name here is invented.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { safeReturnPath, withReturnPath } from './return-to.ts';

describe('safeReturnPath', () => {
  it('keeps a same-site path with its query', () => {
    assert.equal(safeReturnPath('/opportunities/tenders/ABC-12'), '/opportunities/tenders/ABC-12');
    assert.equal(safeReturnPath('/opportunities?type=tenders#top'), '/opportunities?type=tenders#top');
    assert.equal(safeReturnPath(['/a', '/b']), '/a');
  });

  it('refuses anything a browser reads as another host', () => {
    for (const bad of ['https://elsewhere.invalid/x', '//elsewhere.invalid', '/\\elsewhere.invalid',
      'elsewhere.invalid', 'javascript:alert(1)', '/\telsewhere', '/a\\b']) {
      assert.equal(safeReturnPath(bad), null, bad);
    }
  });

  it('refuses empty, overlong and auth paths', () => {
    assert.equal(safeReturnPath(undefined), null);
    assert.equal(safeReturnPath(''), null);
    assert.equal(safeReturnPath('/' + 'x'.repeat(600)), null);
    assert.equal(safeReturnPath('/login'), null);
    assert.equal(safeReturnPath('/register?next=/x'), null);
    assert.equal(safeReturnPath('/forgot-password'), null);
    assert.equal(safeReturnPath('/registered-users'), '/registered-users');
  });
});

describe('withReturnPath', () => {
  it('carries the path along, encoded', () => {
    assert.equal(withReturnPath('/register', '/opportunities/tenders/A B'),
      '/register?next=%2Fopportunities%2Ftenders%2FA%20B');
    assert.equal(withReturnPath('/login?site_name=x', '/a'), '/login?site_name=x&next=%2Fa');
    assert.equal(withReturnPath('/login', null), '/login');
  });
});
