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

// base_sdk 1.54.0: the site credit's rules (Ray, 2026-10-31: "all site
// will be copyright sitename then built with love (as heart) by ROKCT").
// Run by tests/test_manifest.py against a staged copy of
// components/custom/landing/site-credit.ts under node's own test runner
// with type stripping: the words, the year, the line.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  SITE_CREDIT_HEART,
  SITE_CREDIT_LABELS,
  SITE_CREDIT_MAKER,
  SITE_CREDIT_SEPARATOR,
  resolveCreditYear,
  siteCopyright,
  siteCreditLine,
  siteCreditText,
} from './site-credit.ts';

const OCT_2026 = new Date(Date.UTC(2026, 9, 31, 12));

describe('the words', () => {
  it('credits ROKCT with a heart whose name is love', () => {
    assert.equal(SITE_CREDIT_MAKER, 'ROKCT');
    assert.equal(SITE_CREDIT_HEART, '♥');
    assert.equal(SITE_CREDIT_LABELS.love, 'love');
    assert.equal(siteCreditText(), 'Built with ♥ by ROKCT');
  });

  it('separates with a middle dot by default', () => {
    assert.equal(SITE_CREDIT_SEPARATOR, ' · ');
  });

  it('takes a shell\'s own words but keeps the heart and the maker', () => {
    assert.equal(siteCreditText({ builtWith: 'Gebou met', by: 'deur' }), 'Gebou met ♥ deur ROKCT');
  });
});

describe('resolveCreditYear', () => {
  it('is the current year when none is given', () => {
    assert.equal(resolveCreditYear(undefined, OCT_2026), 2026);
    assert.equal(resolveCreditYear(null, OCT_2026), 2026);
    assert.equal(resolveCreditYear(undefined), new Date().getFullYear());
  });

  it('is the configured year when it is a whole, positive number', () => {
    assert.equal(resolveCreditYear(2025, OCT_2026), 2025);
  });

  it('ignores a year that is not one', () => {
    for (const bad of [0, -1, 2025.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.equal(resolveCreditYear(bad, OCT_2026), 2026, String(bad));
    }
  });
});

describe('siteCopyright', () => {
  it('names the site, not the company', () => {
    assert.equal(siteCopyright('Polaris', undefined, OCT_2026), '© 2026 Polaris');
    assert.equal(siteCopyright('  Supacharge  ', 2026), '© 2026 Supacharge');
  });

  it('is empty when the site has no name', () => {
    assert.equal(siteCopyright('', 2026), '');
    assert.equal(siteCopyright('   ', 2026), '');
    assert.equal(siteCopyright(undefined, 2026), '');
    assert.equal(siteCopyright(null, 2026), '');
  });
});

describe('siteCreditLine: the ruling, as text', () => {
  it('reads "© 2026 Polaris · Built with ♥ by ROKCT"', () => {
    assert.equal(siteCreditLine('Polaris', { now: OCT_2026 }), '© 2026 Polaris · Built with ♥ by ROKCT');
  });

  it('keeps the footer\'s own separator', () => {
    assert.equal(
      siteCreditLine('South River', { year: 2026, separator: ' | ' }),
      '© 2026 South River | Built with ♥ by ROKCT',
    );
  });

  it('is the credit alone when the site has no name', () => {
    assert.equal(siteCreditLine('', { year: 2026 }), 'Built with ♥ by ROKCT');
  });

  it('never names the legal entity on its own', () => {
    assert.doesNotMatch(siteCreditLine('Polaris', { year: 2026 }), /PTY|LTD|Copyright/);
  });
});
