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

// agent_sdk 1.21.1: the opportunity pages' published/api row reader, run by
// tests/test_manifest.py against a staged lib/agent-opportunity-cards.ts.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cardForSlug, cardFromRow, isClosed, isOpportunityKind, isValidSlug, openSummaries, parseDate, summariesFromRows,
} from './agent-opportunity-cards.ts';

describe('agent-opportunity-cards', () => {
  it('accepts only the three kinds and safe slugs', () => {
    assert.ok(isOpportunityKind('grants') && isOpportunityKind('equity') && isOpportunityKind('tenders'));
    assert.ok(!isOpportunityKind('opportunities'));
    assert.ok(isValidSlug('2026-04-17_Internationalisation_Strategies_for_SMEs_Malta'));
    for (const bad of ['../README', 'a/b', '', '.env']) assert.ok(!isValidSlug(bad), bad);
  });

  it('builds the page card from a published/api row', () => {
    const card = cardFromRow('grants', {
      title: 'Grant Opportunity: X', slug: 'x', organization: 'Org', deadline: '2026-04-17',
      applying_link: 'https://a.test', flag: 'N/A',
    });
    assert.equal(card.title, 'X');
    assert.equal(card.deadline, '2026-04-17');
    assert.equal(card.applyUrl, 'https://a.test');
    assert.ok(!card.sections[0].fields.some((f) => f.label === 'Flag'));
  });

  it('resolves a slug only from its published row', () => {
    const row = { title: 'Equity Opportunity: 3one4 Capital', slug: '10_3one4_capital', organization: '3one4 Capital' };
    const card = cardForSlug('equity', '10_3one4_capital', row);
    assert.ok(card);
    assert.equal(card.title, '3one4 Capital');
    assert.equal(card.organization, '3one4 Capital');
    assert.equal(cardForSlug('equity', '10_3one4_capital', null), null);
    assert.equal(cardForSlug('equity', 'other', row), null);
    assert.equal(cardForSlug('equity', '../x', { ...row, slug: '../x' }), null);
    assert.deepEqual(summariesFromRows('equity', [row, { title: 'no slug' }]).map((s) => s.slug), ['10_3one4_capital']);
  });

  it('marks past deadlines closed and lists only open ones', () => {
    const now = new Date('2026-09-29T10:00:00Z');
    assert.equal(parseDate('Rolling'), null);
    assert.ok(isClosed('2026-09-28', now));
    assert.ok(!isClosed('2026-09-29', now));
    assert.ok(!isClosed(null, now));
    const rows = [
      { kind: 'grants', slug: 'a', title: 'A', organization: null, deadline: '2026-01-01' },
      { kind: 'grants', slug: 'b', title: 'B', organization: null, deadline: null },
      { kind: 'grants', slug: 'c', title: 'C', organization: null, deadline: '2026-12-01' },
      { kind: 'grants', slug: 'd', title: 'D', organization: null, deadline: '2026-10-01' },
    ] as const;
    assert.deepEqual(openSummaries([...rows], now, 'c').map((r) => r.slug), ['d', 'b']);
  });
});
