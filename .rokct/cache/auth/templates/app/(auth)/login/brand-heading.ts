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
// The brand the sign-in heading says "Welcome to" (auth_sdk 1.7.3).
//
// Ray, 2026-09-11: "login register page, no s, full supacharge without
// .school". The heading prints the shell's own PLATFORM_NAME
// (app/config/platform.ts, this SDK's `requires`), so on the shell whose
// name IS its domain it read "Welcome to supacharge.school". The brand is
// "Supacharge"; the dotted suffix is the address, not the name.
//
// THE RULE IS BASE_SDK'S, NOT THIS SDK'S. base_sdk owns it as
// `brandStemLabel` in components/custom/landing/header-menu.ts (line 727 at
// base_sdk 1.42.0; the function arrived in 1.39.0, `brandStemOf` that it
// builds on in 1.29.0), and base's own client header renders the bar with
// `brandStemLabel(name) ?? stem`. This module is a DELIBERATE COPY of that
// rule rather than an import of it, for three reasons:
//
//   1. base_sdk lives in another repository (RokctAI/core). This SDK's
//      behaviour tests stage its PURE modules flat into a temp directory
//      and run them under `node --experimental-strip-types`
//      (tests/test_manifest.py, STAGED/NODE_SUITES), so a module that
//      imports "@/components/custom/landing/header-menu" cannot be pinned
//      by a test here at all - and the one thing that must not regress,
//      an undotted name left alone, is exactly what a test has to prove.
//   2. This SDK declares a floor of base_sdk >= 1.20.0 (manifest
//      `_comment`). `brandStemLabel` is 1.39.0's, so importing it would
//      raise that floor for every shell that composes auth_sdk.
//   3. components/custom/landing/* is base's LANDING seam set. This SDK
//      requires none of it - only base's kernel services and the chrome it
//      renders - and the sign-in page is not the landing host.
//
// Keep the body identical to base's so the two diff cleanly and stay in
// step. If this SDK ever does require base's landing header, delete this
// module and call `brandStemLabel` directly.

/**
 * The stem a DOTTED name folds to: the text before the first "." of `name`
 * (trimmed), so "a.b.c" gives "a" and "x." gives "x". `null` for a name
 * with no dot and for one that starts with the dot (".x" has nothing before
 * it) - neither is dotted for this rule.
 */
function brandStemOf(name: string | null | undefined): string | null {
  const trimmed = name?.trim() ?? "";
  const dot = trimmed.indexOf(".");
  if (dot <= 0) return null;
  return trimmed.slice(0, dot);
}

/**
 * The brand the heading says: a DOTTED platform name folds to its stem with
 * the first character upper-cased, as the brand writes it - "supacharge.school"
 * is "Supacharge" - and a name with NO dot is returned verbatim, so
 * rokct.ai's "Rokct" reads exactly as it did. Only the first character is
 * ever changed ("acme" is "Acme"; "ACME" and "Acme" are themselves).
 */
export function brandHeadingLabel(name: string): string {
  const stem = brandStemOf(name);
  if (stem === null) return name;
  return stem.charAt(0).toUpperCase() + stem.slice(1);
}
