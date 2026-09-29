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

// agent_sdk 1.20.0: the chat's message shapes on AI SDK 6. Run by
// tests/test_manifest.py against a staged copy of lib/agent-chat-messages.ts.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  localExchange,
  messageFiles,
  messageText,
  messageToolInvocations,
  storedToUIMessages,
  toStoredMessage,
  turnText,
} from './agent-chat-messages.ts';

describe('stored history rows become UIMessages', () => {
  it('keeps text, files and finished tool calls as parts', () => {
    const [user, assistant] = storedToUIMessages(
      JSON.stringify([
        { role: 'user', content: 'hi', experimental_attachments: [{ url: '/files/a.pdf', name: 'a.pdf', contentType: 'application/pdf' }] },
        { role: 'assistant', content: 'done', toolInvocations: [{ state: 'result', toolCallId: 't1', toolName: 'displayNote', args: { a: 1 }, result: { ok: true } }] },
        { role: 'tool', content: [] },
      ]),
    );
    assert.equal(messageText(user), 'hi');
    assert.deepEqual(messageFiles(user), [{ url: '/files/a.pdf', name: 'a.pdf', contentType: 'application/pdf' }]);
    assert.equal(messageText(assistant), 'done');
    assert.deepEqual(messageToolInvocations(assistant), [
      { state: 'result', toolCallId: 't1', toolName: 'displayNote', args: { a: 1 }, result: { ok: true } },
    ]);
  });

  it('passes a row that already has parts through, and reads unreadable input as empty', () => {
    const [m] = storedToUIMessages([{ id: 'x', role: 'user', parts: [{ type: 'text', text: 'p' }] }]);
    assert.equal(m.id, 'x');
    assert.equal(messageText(m), 'p');
    assert.deepEqual(storedToUIMessages('not json'), []);
    assert.deepEqual(storedToUIMessages(null), []);
  });
});

describe('what the route sends and stores', () => {
  it('a files-only turn is named, never empty', () => {
    assert.equal(turnText('  ', [{ url: '/files/r.png', name: 'r.png' }]), 'Attached files:\n- r.png');
    assert.equal(turnText(' hello ', []), 'hello');
    assert.equal(turnText('', []), '');
  });

  it('stores the 4-style row the history list reads', () => {
    assert.deepEqual(toStoredMessage({ role: 'assistant', text: 'ok' }), { role: 'assistant', content: 'ok' });
  });

  it('a local card is a user turn and an answered tool part', () => {
    const [u, a] = localExchange('draft it', 'displayNote', {}, { title: 'n' });
    assert.equal(messageText(u), 'draft it');
    assert.equal(messageToolInvocations(a)[0].toolName, 'displayNote');
    assert.deepEqual(messageToolInvocations(a)[0].result, { title: 'n' });
  });
});
