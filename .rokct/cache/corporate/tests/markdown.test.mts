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


// corporate_sdk 1.1.0: the markdown subset a company page renders. Run by
// tests/test_manifest.py against a copy of
// templates/components/custom/company/markdown-parser.ts under node's own test
// runner with type stripping: every block and inline form parses to the
// tree markdown.tsx renders, an unsafe link is its text, raw HTML stays
// text, and CRLF folds.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { inlineText, isSafeHref, parseInline, parseMarkdown } from './markdown-parser.ts';

describe('parseMarkdown', () => {
  it('reads headings, paragraphs and rules in order', () => {
    const blocks = parseMarkdown('# Title\n\nOne line\nand the next.\n\n---\n\n## Sub ##\n');
    assert.deepEqual(blocks.map((b) => b.type), ['heading', 'paragraph', 'rule', 'heading']);
    assert.equal((blocks[0] as { level: number }).level, 1);
    assert.equal(inlineText((blocks[1] as { children: never[] }).children), 'One line and the next.');
    assert.equal((blocks[3] as { level: number }).level, 2);
    assert.equal(inlineText((blocks[3] as { children: never[] }).children), 'Sub');
  });

  it('reads unordered and ordered lists, quotes and fenced code', () => {
    const blocks = parseMarkdown('- a\n* b\n+ c\n\n1. one\n2) two\n\n> quoted\n> twice\n\n```\nkeep  this\n  as is\n```\n');
    assert.deepEqual(blocks.map((b) => b.type), ['list', 'list', 'quote', 'code']);
    const [ul, ol, quote, code] = blocks as [
      { ordered: boolean; items: never[][] },
      { ordered: boolean; items: never[][] },
      { children: never[] },
      { text: string },
    ];
    assert.equal(ul.ordered, false);
    assert.deepEqual(ul.items.map((i) => inlineText(i)), ['a', 'b', 'c']);
    assert.equal(ol.ordered, true);
    assert.deepEqual(ol.items.map((i) => inlineText(i)), ['one', 'two']);
    assert.equal(inlineText(quote.children), 'quoted twice');
    assert.equal(code.text, 'keep  this\n  as is');
  });

  it('keeps raw HTML as text and folds CRLF', () => {
    const blocks = parseMarkdown('Hello <script>alert(1)</script> there\r\n\r\n<div>x</div>');
    assert.deepEqual(blocks.map((b) => b.type), ['paragraph', 'paragraph']);
    assert.equal(inlineText((blocks[0] as { children: never[] }).children), 'Hello <script>alert(1)</script> there');
    assert.deepEqual((blocks[1] as { children: { type: string }[] }).children.map((n) => n.type), ['text']);
  });

  it('answers no block for an empty document', () => {
    assert.deepEqual(parseMarkdown(''), []);
    assert.deepEqual(parseMarkdown('\n\n  \n'), []);
  });
});

describe('parseInline', () => {
  it('reads strong, emphasis, code and links', () => {
    const run = parseInline('a **b** *c* _d_ `e **not**` [f](/team) g');
    assert.deepEqual(run.map((n) => n.type), [
      'text', 'strong', 'text', 'em', 'text', 'em', 'text', 'code', 'text', 'link', 'text',
    ]);
    assert.equal(inlineText(run), 'a b c d e **not** f g');
    const link = run[9] as { href: string };
    assert.equal(link.href, '/team');
  });

  it('renders a link with an unsafe target as its text', () => {
    const run = parseInline('[x](javascript:alert(1)) and [y](data:text/html,1) and [z](https://a.b/c)');
    assert.deepEqual(run.map((n) => n.type), ['text', 'text', 'text', 'text', 'link']);
    assert.equal(inlineText(run), 'x and y and z');
    assert.equal((run[4] as { href: string }).href, 'https://a.b/c');
  });

  it('leaves unmatched markers and a lone star as text', () => {
    assert.deepEqual(parseInline('2 * 3 = 6 and **open'), [{ type: 'text', text: '2 * 3 = 6 and **open' }]);
  });
});

describe('isSafeHref', () => {
  it('allows http(s), mailto, tel, a site path and an anchor only', () => {
    for (const ok of ['https://x.y', 'http://x.y', 'mailto:a@b.c', 'tel:+1', '/about', '#top']) {
      assert.equal(isSafeHref(ok), true, ok);
    }
    for (const bad of ['javascript:void(0)', 'data:text/html,1', '//x.y', 'vbscript:x', 'about:blank', 'x.y']) {
      assert.equal(isSafeHref(bad), false, bad);
    }
  });
});
