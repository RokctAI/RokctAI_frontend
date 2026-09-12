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

// corporate_sdk 1.2.0: the legal loader's rule, executed. Run by
// tests/test_manifest.py against a copy of
// templates/components/custom/legal/load-legal-doc.ts staged beside stubs
// of base's listPublicTerms, this SDK's getPublicTerm, the tenant
// resolver and the site-data reader (each settable per case) under node's
// own test runner with type stripping. The folder is the document
// outright when the shell is local or has no backend; otherwise the
// backend wins with an enabled document and the bundled page of the slug
// answers when it has none, in any data mode that bundles the folder.

import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { backend } from './corporate-legal.ts';
import { index } from './base-legal.ts';
import { gateway } from './platform-gateway.ts';
import { reader } from './read-site-data.ts';
import {
  bundledLegalDoc,
  legalDocFromSiteData,
  loadLegalDoc,
  loadLegalIndex,
  siteLegalDocs,
} from './load-legal-doc.ts';

const FOLDER = {
  privacy: { title: 'Privacy', markdown: '# Privacy\n\nFrom the folder.' },
  terms: { title: 'Terms', markdown: '# Terms\n\nFrom the folder.' },
};
const BACKEND_DOC = { name: 'terms', title: 'Terms of Service', body: 'From the backend.', disabled: false };
const DISABLED_DOC = { ...BACKEND_DOC, disabled: true };

/** Runs `fn` with console.error captured; answers what it logged. */
async function quietly<T>(fn: () => Promise<T>): Promise<{ result: T; logged: string[] }> {
  const logged: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    logged.push(args.map(String).join(' '));
  };
  try {
    return { result: await fn(), logged };
  } finally {
    console.error = original;
  }
}

beforeEach(() => {
  backend.reset();
  index.reset();
  gateway.reset();
  reader.reset();
});

describe('siteLegalDocs', () => {
  it('is the folder on a local shell that bundles it, and null without the folder', async () => {
    reader.set('local', { legal: FOLDER });
    assert.deepEqual(await siteLegalDocs(), FOLDER);
    reader.set('local', {});
    assert.equal(await siteLegalDocs(), null);
  });

  it('is the folder on a hybrid shell with no backend, and null when one resolves', async () => {
    reader.set('hybrid', { legal: FOLDER });
    gateway.tenant(undefined);
    assert.deepEqual(await siteLegalDocs(), FOLDER);
    gateway.tenant('https://tenant.invalid');
    assert.equal(await siteLegalDocs(), null);
  });

  it('treats a failing tenant resolution as no backend, logged', async () => {
    reader.set('hybrid', { legal: FOLDER });
    gateway.fail(new Error('resolver down'));
    const { result, logged } = await quietly(() => siteLegalDocs());
    assert.deepEqual(result, FOLDER);
    assert.equal(logged.length, 1);
    assert.match(logged[0], /tenant resolution failed/);
  });
});

describe('bundledLegalDoc', () => {
  it('is the bundled page of the slug in any mode that bundles the folder', () => {
    reader.set('hybrid', { legal: FOLDER });
    assert.deepEqual(bundledLegalDoc('privacy'), {
      name: 'privacy', title: 'Privacy', body: '# Privacy\n\nFrom the folder.', disabled: false,
    });
    assert.equal(bundledLegalDoc('cookies'), null);
    reader.set('local', { legal: FOLDER });
    assert.equal(bundledLegalDoc('terms')?.title, 'Terms');
  });

  it('is null without the folder and on a failed read, logged', async () => {
    reader.set('backend', {});
    assert.equal(bundledLegalDoc('privacy'), null);
    reader.set('hybrid', {});
    assert.equal(bundledLegalDoc('privacy'), null);
    reader.set('hybrid', { legal: FOLDER });
    reader.throwOnRead(new Error('bundle broken'));
    const { result, logged } = await quietly(async () => bundledLegalDoc('privacy'));
    assert.equal(result, null);
    assert.equal(logged.length, 1);
    assert.match(logged[0], /bundled data\/legal read failed/);
  });

  it('legalDocFromSiteData maps a page and answers null for a slug the folder lacks', () => {
    assert.deepEqual(legalDocFromSiteData('terms', FOLDER), {
      name: 'terms', title: 'Terms', body: '# Terms\n\nFrom the folder.', disabled: false,
    });
    assert.equal(legalDocFromSiteData('cookies', FOLDER), null);
  });
});

describe('loadLegalDoc', () => {
  it('reads the folder outright on a local shell and never asks the backend', async () => {
    reader.set('local', { legal: FOLDER });
    backend.answer(BACKEND_DOC);
    assert.equal((await loadLegalDoc('terms'))?.body, '# Terms\n\nFrom the folder.');
    assert.equal(await loadLegalDoc('cookies'), null);
    assert.deepEqual(backend.asked, []);
  });

  it('lets the backend win with an enabled document on a hybrid shell', async () => {
    reader.set('hybrid', { legal: FOLDER });
    gateway.tenant('https://tenant.invalid');
    backend.answer(BACKEND_DOC);
    assert.deepEqual(await loadLegalDoc('terms'), BACKEND_DOC);
    assert.deepEqual(backend.asked, ['terms']);
  });

  it('falls back to the bundled slug when the backend answers nothing, in hybrid mode', async () => {
    reader.set('hybrid', { legal: FOLDER });
    gateway.tenant('https://tenant.invalid');
    backend.answer(null);
    assert.equal((await loadLegalDoc('terms'))?.body, '# Terms\n\nFrom the folder.');
    assert.equal((await loadLegalDoc('privacy'))?.title, 'Privacy');
    assert.equal(await loadLegalDoc('cookies'), null);
    assert.deepEqual(backend.asked, ['terms', 'privacy', 'cookies']);
  });

  it('falls back to the bundled slug for a disabled backend document, as the index skips it', async () => {
    reader.set('hybrid', { legal: FOLDER });
    gateway.tenant('https://tenant.invalid');
    backend.answer(DISABLED_DOC);
    assert.equal((await loadLegalDoc('terms'))?.body, '# Terms\n\nFrom the folder.');
    reader.set('hybrid', { legal: { privacy: FOLDER.privacy } });
    assert.equal(await loadLegalDoc('terms'), null, 'disabled and not bundled is a 404');
  });

  it('falls back to the bundled slug when the folder is bundled in backend mode too', async () => {
    reader.set('backend', { legal: FOLDER });
    gateway.tenant('https://tenant.invalid');
    backend.answer(null);
    assert.equal((await loadLegalDoc('privacy'))?.title, 'Privacy');
  });

  it('is null with no folder when the backend answers nothing, as before', async () => {
    reader.set('backend', {});
    gateway.tenant('https://tenant.invalid');
    backend.answer(null);
    assert.equal(await loadLegalDoc('terms'), null);
    reader.set('hybrid', {});
    gateway.tenant(undefined);
    assert.equal(await loadLegalDoc('terms'), null);
  });
});

describe('loadLegalIndex', () => {
  it('lists the folder in slug order when the folder is what the pages read', async () => {
    reader.set('local', { legal: FOLDER });
    index.answer([{ name: 'zzz', title: 'Backend', disabled: false }]);
    assert.deepEqual(await loadLegalIndex(), [
      { name: 'privacy', title: 'Privacy', disabled: false },
      { name: 'terms', title: 'Terms', disabled: false },
    ]);
    assert.equal(index.asked, 0);
  });

  it("is base's list otherwise, whatever it answers", async () => {
    reader.set('hybrid', { legal: FOLDER });
    gateway.tenant('https://tenant.invalid');
    index.answer([{ name: 'terms', title: 'Terms of Service', disabled: false }]);
    assert.deepEqual(await loadLegalIndex(), [{ name: 'terms', title: 'Terms of Service', disabled: false }]);
    index.answer([]);
    assert.deepEqual(await loadLegalIndex(), []);
    assert.equal(index.asked, 2);
  });
});
