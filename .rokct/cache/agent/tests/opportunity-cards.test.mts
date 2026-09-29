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

// agent_sdk 1.21.0: the opportunity pages' card reader, run by
// tests/test_manifest.py against a staged lib/agent-opportunity-cards.ts.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cardFromRow, cardPath, isClosed, isOpportunityKind, isValidSlug, openSummaries, parseCard, parseDate,
} from './agent-opportunity-cards.ts';

const GRANT = `# Grant Opportunity: KSHITIJ 2.0 (India)

## Quick Stats
- **Organization**: ICAR
- **Deadline**: 2026-07-31
- **Funding Amount**: Incubation support

## Eligibility
- Fish farmers and early-stage startups

## Description
A 2-month virtual incubation programme.

## How to Apply
- **Applying Link**: https://apply.test/kshitij
- **Source Card**: sources/x.md

## Audit & Status
- **Verification Status**: UNVERIFIED
`;

const TENDER = `# Tender Opportunity: RFQ25 Working tools

## Quick Stats
- **Institution**: Musina Local Municipality
- **Closing Date**: See Documents

## Documents & Links
- **Direct Link**: https://musina.test/rfq25.pdf
- **Tender Documents**:
    - [RFQ Document](https://musina.test/rfq25.pdf)

## Audit & Status
- **Status**: ACTIVE
---
# Trigger build: 2026-05-09
`;

describe('agent-opportunity-cards', () => {
  it('maps each kind to its card path in the repo', () => {
    assert.equal(cardPath('tenders', 'musina-rfq25'), '03_tenders/musina-rfq25/musina-rfq25.md');
    assert.equal(cardPath('equity', '10x_group'), '01_equity/10x_group.md');
    assert.equal(cardPath('grants', '2026-07-31_A_B'), '02_grants/2026-07-31_A_B.md');
  });

  it('accepts only the three kinds and safe slugs', () => {
    assert.ok(isOpportunityKind('grants') && isOpportunityKind('equity') && isOpportunityKind('tenders'));
    assert.ok(!isOpportunityKind('opportunities'));
    assert.ok(isValidSlug('2026-04-17_Internationalisation_Strategies_for_SMEs_Malta'));
    for (const bad of ['../README', 'a/b', '', '.env']) assert.ok(!isValidSlug(bad), bad);
  });

  it('reads a grant card: title, sections, deadline, apply link', () => {
    const card = parseCard('grants', 'k', GRANT);
    assert.ok(card);
    assert.equal(card.title, 'KSHITIJ 2.0 (India)');
    assert.deepEqual(card.sections.map((s) => s.heading),
      ['Quick Stats', 'Eligibility', 'Description', 'How to Apply', 'Audit & Status']);
    assert.equal(card.deadline, '2026-07-31');
    assert.equal(card.applyUrl, 'https://apply.test/kshitij');
    assert.equal(card.organization, 'ICAR');
    assert.deepEqual(card.sections[2].text, ['A 2-month virtual incubation programme.']);
  });

  it('reads a tender card and stops at the trailer', () => {
    const card = parseCard('tenders', 'musina-rfq25', TENDER);
    assert.ok(card);
    assert.equal(card.deadline, null);
    assert.equal(card.applyUrl, 'https://musina.test/rfq25.pdf');
    assert.ok(!card.sections.some((s) => s.heading.includes('Trigger')));
    assert.ok(card.sections[1].fields.some((f) => f.label === 'RFQ Document'));
  });

  it('builds a card from a json row when the markdown is missing', () => {
    const card = cardFromRow('grants', {
      title: 'Grant Opportunity: X', slug: 'x', organization: 'Org', deadline: '2026-04-17',
      applying_link: 'https://a.test', flag: 'N/A',
    });
    assert.equal(card.title, 'X');
    assert.equal(card.deadline, '2026-04-17');
    assert.equal(card.applyUrl, 'https://a.test');
    assert.ok(!card.sections[0].fields.some((f) => f.label === 'Flag'));
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
