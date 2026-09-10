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

// base_sdk 1.20.0: only the LAYOUT's Metadata carries `icons`. Run by
// tests/test_manifest.py against a staged copy of app/lib/site-metadata.ts
// (registry stubbed to one copy with no icon, cwd a directory with no
// icon file), under node's own test runner with type stripping.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  GENERATED_BRAND_ICON,
  buildPageMetadata,
  buildSiteMetadata,
} from './site-metadata.ts';

describe('icons and the metadata scope', () => {
  it('the layout resolves icons (generated here: no host file, no copy.icon)', async () => {
    const layout = await buildSiteMetadata();
    assert.ok('icons' in layout, 'layout carries icons');
    assert.ok(JSON.stringify(layout.icons).includes(GENERATED_BRAND_ICON));
    assert.deepEqual(layout.title, { default: 'Shell', template: '%s — Shell' });
  });

  it('a page carries no icons key at all, so the layout stays the owner', async () => {
    const page = await buildPageMetadata();
    assert.equal('icons' in page, false, JSON.stringify(page.icons));
    assert.deepEqual(page.title, { absolute: 'Shell' });
    assert.equal(page.applicationName, 'Shell');
  });

  it('an explicit icons override is returned untouched, in either scope', async () => {
    const icons = { icon: '/images/logo.svg', apple: '/images/logo.png' };
    const layout = await buildSiteMetadata({ icons });
    assert.deepEqual(layout.icons, icons);
    const page = await buildPageMetadata({ icons });
    assert.deepEqual(page.icons, icons);
  });
});
