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

// base_sdk 1.37.0: the footer legal links (Ray, 2026-09-10: "supa has no
// terms pages or about page"; the pages are corporate_sdk's, base carries
// the links and the guest read). Run by tests/test_manifest.py against a
// staged copy of components/custom/landing/legal-links.ts beside
// footer-chrome-config.ts, under node's own test runner with type
// stripping.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_LEGAL_GROUP_LABEL,
  LEGAL_DOCTYPE,
  LEGAL_GROUP_ID,
  LEGAL_ROUTE,
  legalDocHref,
  legalFooterLinks,
  normalisePublicTerms,
  type PublicTerm,
} from './legal-links.ts';

describe('normalisePublicTerms: the gateway rows', () => {
  it('null (no backend, a failed call) is an empty list', () => {
    assert.deepEqual(normalisePublicTerms(null), []);
    assert.deepEqual(normalisePublicTerms(undefined), []);
    assert.deepEqual(normalisePublicTerms({}), []);
    assert.deepEqual(normalisePublicTerms('nope'), []);
  });

  it('keeps enabled rows with a name and a title, in order, and reads the message envelope too', () => {
    const rows = [
      { name: 'privacy-policy', title: 'Privacy Policy', disabled: 0 },
      { name: 'terms', title: 'Terms of Service', disabled: '0' },
    ];
    const expected: PublicTerm[] = [
      { name: 'privacy-policy', title: 'Privacy Policy', disabled: false },
      { name: 'terms', title: 'Terms of Service', disabled: false },
    ];
    assert.deepEqual(normalisePublicTerms(rows), expected);
    assert.deepEqual(normalisePublicTerms({ message: rows }), expected);
  });

  it('drops disabled rows (1, true, "1") and rows with no name or title', () => {
    const rows = [
      { name: 'old', title: 'Old Terms', disabled: 1 },
      { name: 'older', title: 'Older Terms', disabled: true },
      { name: 'oldest', title: 'Oldest Terms', disabled: '1' },
      { name: '', title: 'Nameless' },
      { name: 'untitled', title: '   ' },
      { title: 'No name at all' },
      null,
      42,
      { name: 'cookies', title: 'Cookie Policy' },
    ];
    assert.deepEqual(normalisePublicTerms(rows), [
      { name: 'cookies', title: 'Cookie Policy', disabled: false },
    ]);
  });
});

describe('legalDocHref: the route', () => {
  it('is /legal/<name>, encoded', () => {
    assert.equal(LEGAL_ROUTE, '/legal');
    assert.equal(legalDocHref('privacy-policy'), '/legal/privacy-policy');
    assert.equal(legalDocHref('Terms & Conditions'), '/legal/Terms%20%26%20Conditions');
    assert.equal(legalDocHref('a/b'), '/legal/a%2Fb');
  });
});

describe('legalFooterLinks: the footer group', () => {
  const terms: PublicTerm[] = [
    { name: 'privacy-policy', title: 'Privacy Policy', disabled: false },
    { name: 'terms', title: 'Terms of Service', disabled: false },
  ];

  it('is NO group when nothing is published, so a footer that spreads it draws nothing new', () => {
    assert.deepEqual(legalFooterLinks([]), []);
    assert.deepEqual(
      legalFooterLinks([{ name: 'x', title: 'X', disabled: true }]),
      [],
    );
  });

  it('is one "Legal" group with one link per document, titled by the document', () => {
    const groups = legalFooterLinks(terms);
    assert.equal(groups.length, 1);
    const [group] = groups;
    assert.equal(group.id, LEGAL_GROUP_ID);
    assert.equal(group.label, DEFAULT_LEGAL_GROUP_LABEL);
    assert.equal(group.label, 'Legal');
    assert.deepEqual(group.items, [
      { id: 'legal-privacy-policy', label: 'Privacy Policy', href: '/legal/privacy-policy' },
      { id: 'legal-terms', label: 'Terms of Service', href: '/legal/terms' },
    ]);
    for (const item of group.items) assert.equal(item.external, undefined);
  });

  it('takes the caller\'s label and skips disabled, blank and duplicate names', () => {
    const groups = legalFooterLinks(
      [
        ...terms,
        { name: 'terms', title: 'Terms again', disabled: false },
        { name: 'gone', title: 'Gone', disabled: true },
        { name: '', title: 'Blank', disabled: false },
      ],
      'Policies',
    );
    assert.equal(groups[0].label, 'Policies');
    assert.deepEqual(
      groups[0].items.map((i) => i.href),
      ['/legal/privacy-policy', '/legal/terms'],
    );
  });

  it('names the doctype the admin editor writes', () => {
    assert.equal(LEGAL_DOCTYPE, 'Terms and Conditions');
  });
});
