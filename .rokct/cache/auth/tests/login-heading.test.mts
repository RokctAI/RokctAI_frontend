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
// The sign-in heading's brand (auth_sdk 1.7.3). Run by
// tests/test_manifest.py against a staged copy of
// app/(auth)/login/brand-heading.ts under node's own test runner (22.6+,
// type stripping).
//
// The two cases that matter are the two shells that compose this SDK: one
// whose PLATFORM_NAME is its dotted domain, and one whose name carries no
// dot at all. The second is a REGRESSION GUARD - the undotted name must
// come back byte for byte - and it is why this rule is a function and not
// a string operation at the call site.

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { brandHeadingLabel } from "./brand-heading.ts";

describe("brandHeadingLabel on a DOTTED platform name", () => {
  it("drops the suffix and capitalises the stem the brand way", () => {
    assert.equal(brandHeadingLabel("supacharge.school"), "Supacharge");
  });

  it("keeps everything before the FIRST dot only", () => {
    assert.equal(brandHeadingLabel("a.b.c"), "A");
    assert.equal(brandHeadingLabel("x."), "X");
  });

  it("changes the first character and nothing else", () => {
    assert.equal(brandHeadingLabel("supacharge.school"), "Supacharge");
    assert.equal(brandHeadingLabel("ACME.tld"), "ACME");
    assert.equal(brandHeadingLabel("Acme.tld"), "Acme");
  });

  it("trims the name before folding it", () => {
    assert.equal(brandHeadingLabel("  supacharge.school  "), "Supacharge");
  });
});

describe("brandHeadingLabel on a name with NO dot", () => {
  it("returns it unchanged - rokct.ai reads exactly as it did", () => {
    assert.equal(brandHeadingLabel("Rokct"), "Rokct");
  });

  it("never capitalises, trims or otherwise touches an undotted name", () => {
    for (const name of [
      "Rokct",
      "rokct",
      "ROKCT",
      "South River",
      "  Rokct  ",
      "",
    ]) {
      assert.equal(brandHeadingLabel(name), name, name);
    }
  });

  it("treats a name that STARTS with the dot as undotted", () => {
    assert.equal(brandHeadingLabel(".school"), ".school");
  });
});
